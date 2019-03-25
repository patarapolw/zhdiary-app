import UserDb from ".";
import ZhDb from "../zhdb";
import Config from "../config";
import XRegExp from "xregexp";

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
    }).map((el) => {
        let entry: string | undefined = el.vocab;

        if (!entry) {
            const m = el.template ? /^v\/(\S+)/.exec(el.template) : null;
            if (m) {
                entry = m[1];
            }
        }

        if (!entry) {
            const m = el.back ? /^## (\S+)/.exec(el.back) : null;
            if (m) {
                entry = m[1];
            }
        }

        let level: number | undefined;
        let levels: number[] | undefined;

        const token = zhDb!.token!.findOne({entry});
        if (token && token.level) {
            level = token.level.vocab;
        }

        if (!level && entry) {
            const cond = entry.split("").filter((c) => XRegExp("\\p{Han}").test(c));
            const tokens = zhDb!.token!.chain().find({entry: {$in: cond}}).sort((a, b) => {
                return (a.level && b.level) ? (b.level!.hanzi || 100) - (a.level!.hanzi || 100) : 0;
            }).data();

            if (tokens.length > 0 && tokens[0].level) {
                level = tokens[0].level.hanzi;
                // @ts-ignore
                levels = tokens.filter((t) => t.level).map((t) => t.level!.hanzi).filter((lv) => lv);
            }
        }

        delete el.$loki;
        delete el.vocab;

        const levelType = levels ? "hanzi" : "vocab";

        return {
            ...el,
            vocab: entry,
            level,
            levels,
            levelType,
            cLevel: levelType === "hanzi" ? level : undefined,
            vLevel: levelType === "vocab" ? level : undefined
        };
    });

    return q;
}
