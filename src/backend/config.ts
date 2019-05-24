import ZhLokiDb from "./db/zh";
import LokiDb from "./db";
import dotenv from "dotenv";
// @ts-ignore
import { AppDirs } from "appdirs";
import path from "path";
import fs from "fs";

dotenv.config();

export interface IConfig {
    zhDb?: ZhLokiDb;
    userDb?: LokiDb;
    COLLECTION: string;
    PORT: string;
}

const userDataDir = new AppDirs("rep2recall").userDataDir();
if (!process.env.COLLECTION && !fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir);
}

export const Config: IConfig = {
    COLLECTION: process.env.COLLECTION || path.join(userDataDir, "user.loki"),
    PORT: process.env.PORT || "50985"
};

export default Config;
