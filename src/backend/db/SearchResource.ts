import SearchParser, { mongoToFilter } from "./MongoQParser";
import ZhLokiDb, { IDbDataToken, IDbDataVocab } from "./zh";
import LokiDb, { IDbCard, IDbDeck } from ".";
import Config from "../config";

export class SearchResource {
    private zhDb: ZhLokiDb;
    private userDb: LokiDb;
    private parser: SearchParser;

    constructor(userDb?: LokiDb, zhDb?: ZhLokiDb, anyOf: string[] = ["template", "entry", "front", "back", "note", "deck"]) {
        this.userDb = userDb || Config.userDb!;
        this.zhDb = zhDb || Config.zhDb!;

        this.parser = new SearchParser({
            anyOf,
            isString: ["template", "entry", "front", "back", "note", "deck"],
            isDate: ["nextReview"],
            isList: ["tag"],
            flattenDates: true
        });
    }

    public parse(q?: string) {
        return this.parser.parse(q);
    }

    public getFilter(q?: string) {
        return mongoToFilter(this.parse(q));
    }

    public getQuery() {
        const dataL = this.zhDb.token
        .eqJoin(this.zhDb.vocab, "name", "simplified", (l: IDbDataToken, r: IDbDataVocab) => {
            const {$loki, name, sub, sup, frequency, vocabLevel, hanziLevel, tag} = l;
            const {simplified, traditional, pinyin, english} = r;
            return {id: $loki, entry: name, var: l.var, sub, sup, frequency, vocabLevel, hanziLevel, tag,
                simplified, traditional, pinyin, english};
        }).data();

        const dataR = this.userDb.card
        .eqJoin(this.userDb.deck, "deckId", "$loki", (l: IDbCard, r: IDbDeck) => {
            const {entry, $loki, front, back, mnemonic, srsLevel, nextReview, created, modified, tag, template} = l;
            return {entry, cardId: $loki, front, back, mnemonic, srsLevel, nextReview, created, modified, tag, template,
                deck: r.name};
        }).data();

        return fullJoin({data: dataL, key: "entry"}, {data: dataR, key: "entry"}, (l, r) => {
            const {id, entry, /* var, */ sub, sup, frequency, vocabLevel, hanziLevel, /* tag, */
                simplified, traditional, pinyin, english} = l;
            const {cardId, front, back, mnemonic, srsLevel, nextReview, created, modified, /* tag, */ template,
                deck} = r;
            return {id, entry, var: l.var, sub, sup, frequency, vocabLevel, hanziLevel,
                simplified, traditional, pinyin, english,
                cardId, front, back, mnemonic, srsLevel, nextReview, created, modified, template,
                deck,
                tag: [...(l.tag || []), ...(r.tag || [])]
            };
        });
    }
}

export default SearchResource;

interface IJoinCollection<T> {
    data: T[];
    key: keyof T;
}

function fullJoin<T, U>(
    colL: IJoinCollection<T>,
    colR: IJoinCollection<U>,
    mapFn: (l: T, r: U) => any
): any[] {
    const joinMapL: any = {};
    const joinMapR: any = {};
    const result: any[] = [];

    for (const rowR of colR.data) {
        const v = rowR[colR.key];

        if (v) {
            joinMapR[v] = joinMapR[v] || [];
            joinMapR[v].push(rowR);
        } else {
            result.push({} as T, rowR);
        }
    }

    for (const rowL of colL.data) {
        const v = rowL[colL.key];

        if (v) {
            for (const vR of joinMapR[v] || [{}]) {
                result.push(mapFn(rowL, vR));
            }
        } else {
            result.push(mapFn(rowL, {} as U));
        }
    }

    return result;
}
