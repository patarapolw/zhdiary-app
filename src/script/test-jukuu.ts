import fetch from "node-fetch";
import cheerio from "cheerio";

(async () => {
    const url = new URL("http://www.jukuu.com/search.php");
    url.searchParams.set("q", "你");
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

    console.log(out);
})();
