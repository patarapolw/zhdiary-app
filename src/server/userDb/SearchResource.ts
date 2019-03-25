import UserDb from ".";
import ZhDb from "../zhdb";
import Config from "../config";
import cLevelJson from "../zhdb/cLevel.json";

export function getQuery(userDb?: UserDb, zhDb?: ZhDb) {
    if (!userDb) {
        userDb = Config.userDb;
    }

    if (!zhDb) {
        zhDb = Config.zhDb;
    }

    const q = userDb!.card!.eqJoin(userDb!.deck!, "deckId", "$loki", (l, r) => {
        const {front, back, note, tag, srsLevel, nextReview, template, vocab} = l;
        const deck = r.name;
        return {id: l.$loki, front, back, note, tag, srsLevel, nextReview, template, vocab, deck};
    }).eqJoin(zhDb!.token!, (c) => {
        let entry: string | undefined = c.vocab;

        if (!entry) {
            const m = c.template ? /^v\/(\S+)/.exec(c.template) : null;
            if (m) {
                entry = m[1];
            }
        }

        if (!entry) {
            const m = c.back ? /^## (\S+)/.exec(c.back) : null;
            if (m) {
                entry = m[1];
            }
        }

        return entry || "";
    }, (t) => t.entry, (l, r) => {
        delete l.$loki;
        return {
            ...l,
            vocab: r.entry,
            tLevel: r.level,
            vLevel: r.level ? r.level.vocab : undefined
        };
    }).map((el) => {
        el.cLevels = el.vocab ? el.vocab.split("").map((c: string) => {
            for (const lv of Object.keys(cLevelJson)) {
                if ((cLevelJson as any)[lv].indexOf(c) !== -1) {
                    return parseInt(lv);
                }
            }
            return null;
        }).filter((lv: number | null) => lv) : [];

        if (el.cLevels.length > 0) {
            el.cLevel = Math.max(...el.cLevels);
        }

        delete el.$loki;

        return {
            ...el,
            level: el.cLevel && el.cLevel < el.vLevel ? el.cLevel : el.vLevel
        };
    });

    return q;
}
