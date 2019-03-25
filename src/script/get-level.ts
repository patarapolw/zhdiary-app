import ZhDb from "../server/zhdb";
import UserDb from "../server/userDb";
import { getQuery } from "../server/userDb/SearchResource";
import Config from "../server/config";
import LokiSearchQuery from "../server/search-query";

(async () => {
    const zhDb = await ZhDb.connect();
    const userDb = await UserDb.connect();
    const parser: LokiSearchQuery = Config.searchParser;

    console.log(getQuery(userDb, zhDb).find(parser.search("cLevel<10")).data().map((el) => {
        const {vocab, level, levels} = el;
        return {vocab, level, levels};
    }));

    zhDb.close();
    userDb.close();
})();
