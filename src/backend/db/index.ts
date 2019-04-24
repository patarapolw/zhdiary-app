import Loki, { Collection } from "@lokidb/loki";
import { FSStorage } from "@lokidb/fs-storage";
import fs from "fs";
import dotenv from "dotenv";
import moment from "moment";
import { getOnlineSentence } from "../zh/juuku";
import { ITemplate, getTemplateFromData } from "../zh/template";
import ZhLokiDb from "./zh";
dotenv.config();

FSStorage.register();

export interface IDbCard {
    $loki?: number;
    deckId?: number;
    entry: string;
    template?: string;
    front: string;
    back?: string;
    mnemonic?: string;
    srsLevel?: number;
    nextReview?: Date;
    tag?: string[];
    created: Date;
    modified?: Date;
}

export interface IDbDeck {
    $loki?: number;
    name: string;
    isOpen?: boolean;
}

export interface IEntry {
    $loki?: number;
    entry: string;
    template?: string;
    deck: string;
    front: string;
    back?: string;
    mnemonic?: string;
    srsLevel?: number;
    nextReview?: Date;
    tag?: string[];
    created?: Date;
    modified?: Date;
}

export class LokiDb {
    public static async connect(filename: string): Promise<LokiDb> {
        const loki = new Loki(filename);
        await loki.initializePersistence({
            autoload: fs.existsSync(filename),
            autosave: true,
            autosaveInterval: 4000
        });

        return new LokiDb(loki);
    }

    public card: Collection<IDbCard>;
    public deck: Collection<IDbDeck>;

    private db: Loki;

    private constructor(db: Loki) {
        this.db = db;

        this.card = this.db.getCollection("card");
        if (this.card === null) {
            this.card = this.db.addCollection("card", {
                unique: ["front"]
            });
        }

        this.deck = this.db.getCollection("deck");
        if (this.deck === null) {
            this.deck = this.db.addCollection("deck", {
                unique: ["name"]
            });
        }
    }

    public async create(zhDb: ZhLokiDb, vocabs: string[]): Promise<number[]> {
        let entries = zhDb.vocab.find({$or: [
            {simplified: {$in: vocabs}},
            {traditional: {$in: vocabs}}
        ]});

        const subEntries: any = {};
        entries.forEach((e) => {
            subEntries[e.simplified] = subEntries[e.simplified] || [];
            subEntries[e.simplified].push(e);
        });
        entries = [];

        for (const k of Object.keys(subEntries)) {
            const ss = subEntries[k].filter((s: any) => !(/^variant of/i.test(s.english) || /^surname/i.test(s.english) || s.english.indexOf(s.simplified) !== -1));
            if (ss.length === 0) {
                entries.push(subEntries[0]);
            } else {
                entries.push(ss[0]);
            }
        }

        const sentences = entries.map((e) => {
            return zhDb.sentence.find({chinese: {$regex: e.simplified}});
        });

        const extras = await Promise.all(sentences.map((s, i) => {
            if (s.length < 10) {
                return getOnlineSentence(entries[i].simplified);
            } else {
                return [];
            }
        }));

        const ts: ITemplate[] = entries.map((e, i) => {
            return getTemplateFromData(e, [...sentences[i], ...extras[i]]);
        }).reduce((a, b) => [...a, ...b]);

        const now = new Date();

        return this.card.insert(ts.map((t) => {
            return {
                front: t.front,
                back: t.back,
                entry: t.entry,
                template: t.name,
                created: now
            };
        })).map((c) => c.$loki);
    }

    public update(u: Partial<IEntry>) {
        const c = this.transformUpdate(u);

        c.modified = new Date();
        return this.card.updateWhere((c0) => c0.$loki === c.$loki, (c0) => {
            return Object.assign(c0, c);
        });
    }

    private transformUpdate(u: Partial<IEntry>): Partial<IDbCard> {
        const output: Partial<IDbCard> = {};

        for (const k of Object.keys(u)) {
            const v = (u as any)[k];

            if (k === "deck") {
                let d = this.deck.findOne({name: v});
                if (d === null) {
                    d = this.deck.insertOne({name: v});
                }

                delete (u as any)[k];
                output.deckId = d.$loki;
            } else if (["nextReview", "created", "modified"].indexOf(k) !== -1) {
                output.nextReview = moment(v).toDate();
            } else {
                (output as any)[k] = v;
            }
        }

        return output;
    }
}

export default LokiDb;
