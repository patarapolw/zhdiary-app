import SearchParser from "./MongoQParser";
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

    public getQuery() {
        return this.zhDb.token.eqJoin(this.zhDb.vocab, "name", "simplified", (l: IDbDataToken, r: IDbDataVocab) => {
            const {$loki, name, sub, sup, frequency, vocabLevel, hanziLevel, tag} = l;
            const {simplified, traditional, pinyin, english} = r;
            return {id: $loki, entry: name, var: l.var, sub, sup, frequency, vocabLevel, hanziLevel, tag,
                simplified, traditional, pinyin, english};
        }).eqJoin(this.userDb.card, "entry", "entry", (l, r: IDbCard) => {
            const tag0 = l.tag || [];
            delete l.$loki;
            delete l.tag;

            const {$loki, front, back, mnemonic, srsLevel, nextReview, created, modified, deckId, tag, template} = r;
            return {...l, cardId: $loki, front, back, mnemonic, srsLevel, nextReview, created, modified, deckId,
                tag: [...tag0, ...(tag || [])], template};
        }).eqJoin(this.userDb.deck, "deckId", "$loki", (l, r: IDbDeck) => {
            delete l.$loki;
            delete l.deckId;
            return {...l, deck: r.name};
        });
    }
}

export default SearchResource;
