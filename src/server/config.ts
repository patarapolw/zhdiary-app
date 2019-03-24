import yaml from "js-yaml";
import fs from "fs";
import MongoSearchQuery from "./search-query";

export const Config = yaml.safeLoad(fs.readFileSync("config.yml", "utf8"));

Config.searchParser = new MongoSearchQuery({
    any: ["front", "back"]
});

export default Config;
