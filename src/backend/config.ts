import ZhLokiDb from "./db/zh";
import LokiDb from "./db";
import dotenv from "dotenv";
// @ts-ignore
import { AppDirs } from "appdirs";
import path from "path";

dotenv.config();

export interface IConfig {
    zhDb?: ZhLokiDb;
    userDb?: LokiDb;
    COLLECTION: string;
    PORT: string;
}

export const Config: IConfig = {
    COLLECTION: process.env.COLLECTION || path.join(new AppDirs("zhdiary").userDataDir(), "user.loki"),
    PORT: process.env.PORT || "50985"
};

export default Config;
