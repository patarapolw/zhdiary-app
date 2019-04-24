import cheerio from "cheerio";
import fetch from "node-fetch";
import { IDbDataSentence } from "../db/zh";

export async function getOnlineSentence(v: string): Promise<IDbDataSentence[]> {
    const url = new URL("http://www.jukuu.com/search.php");
    url.searchParams.set("q", v);
    const $ = cheerio.load(await (await fetch(url.href)).text());
    const cs = $("tr.c").toArray();
    const es = $("tr.e").toArray();
    const out = [] as any[];

    cs.forEach((_, i) => {
        out.push({
            chinese: $(cs[i]).text().trim(),
            english: $(es[i]).text().replace(/^\d+\. +/, "").trim()
        });
    });

    return out;
}
