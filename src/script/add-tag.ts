import ZhLokiDb from "../backend/db/zh";
import fs from "fs";

(async () => {
    const localDb = await ZhLokiDb.connect("public/zh.loki");

    const content = fs.readFileSync("resource/生词.md", "utf8");
    let title = "";
    let vs: string[] = [];

    for (const row of content.split("\n")) {
        if (row[0] === "#") {
            title = row.slice(2);
        } else if (row.trim()) {
            vs = row.trim().split("，");
            if (title) {
                localDb.token.updateWhere((t) => vs.indexOf(t.name) !== -1, (t) => {
                    t.tag = t.tag || [];
                    if (t.tag.indexOf(title) === -1) {
                        t.tag.push(title);
                    }
                    return t;
                });
            }
        }
    }

    localDb.close();
})();
