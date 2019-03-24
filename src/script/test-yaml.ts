import yaml from "js-yaml";
import fs from "fs";

console.log(yaml.safeLoad(fs.readFileSync("config.yml", "utf8")));
