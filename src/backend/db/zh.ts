import Loki, { Collection } from "@lokidb/loki";
import { FSStorage } from "@lokidb/fs-storage";
import fs from "fs";

FSStorage.register();

export interface IDbDataSentence {
    $loki?: number;
    chinese: string;
    english: string;
}

export interface IDbDataToken {
    $loki?: number;
    name: string;
    sup?: string[];
    sub?: string[];
    var?: string[];
    frequency?: number;
    vocabLevel?: number;
    hanziLevel?: number[];
    tag?: string[];
}

export interface IDbDataVocab {
    $loki?: number;
    simplified: string;
    traditional?: string;
    pinyin: string;
    english: string;
}

export class ZhLokiDb {
    public static async connect(filename: string): Promise<ZhLokiDb> {
        const loki = new Loki(filename);
        await loki.initializePersistence({
            autoload: fs.existsSync(filename),
            autosave: true,
            autosaveInterval: 4000
        });

        return new ZhLokiDb(loki);
    }

    public sentence: Collection<IDbDataSentence>;
    public token: Collection<IDbDataToken>;
    public vocab: Collection<IDbDataVocab>;

    private db: Loki;

    private constructor(db: Loki) {
        this.db = db;

        this.sentence = this.db.getCollection("sentence");
        if (this.sentence === null) {
            this.sentence = this.db.addCollection("sentence", {
                unique: ["chinese"]
            });
        }

        this.token = this.db.getCollection("token");
        if (this.token === null) {
            this.token = this.db.addCollection("token", {
                unique: ["name"]
            });
        }

        this.vocab = this.db.getCollection("vocab");
        if (this.vocab === null) {
            this.vocab = this.db.addCollection("vocab");
        }
    }

    public close() {
        this.db.close();
    }
}

export default ZhLokiDb;
