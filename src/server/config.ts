import yaml from "js-yaml";
import fs from "fs";
import LokiSearchQuery from "./search-query";

export const Config = yaml.safeLoad(fs.readFileSync("config.yml", "utf8"));

Config.searchParser = new LokiSearchQuery({
    any: ["front", "back", "deck"],
    isDate: ["nextReview"]
});

export default Config;
