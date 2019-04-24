import TDService from "turndown";
import h from "hyperscript";
import { IDbDataVocab, IDbDataSentence } from "../db/zh";

export interface ITemplate {
    name: string;
    entry: string;
    front: string;
    back?: string;
    note?: string;
}

const td = new TDService();

export function getTemplateFromData(v: IDbDataVocab, ss: IDbDataSentence[]): ITemplate[] {
    const back = td.turndown(h("div", [
        h("h3", v.simplified),
        v.traditional ? h("h4", v.traditional) : h("div"),
        h("div", v.pinyin),
        h("div", v.english),
        h("ul", ss.slice(0, 10).map((s) => {
            return h("li", [
                h("span", s.chinese),
                h("ul", h("li", s.english))
            ]);
        }))
    ]).outerHTML);

    const templates = [
        {name: "EC", front: td.turndown(h("h4", v.english).outerHTML), back, entry: v.simplified},
        {name: "SE", front: td.turndown(h("h4", v.simplified).outerHTML), back, entry: v.simplified}
    ];

    if (v.traditional) {
        templates.push({name: "TE", front: td.turndown(h("h4", v.traditional).outerHTML), back, entry: v.simplified});
    }

    return templates;
}
