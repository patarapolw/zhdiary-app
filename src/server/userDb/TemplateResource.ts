import Config from "../config";
import ZhDb, { IVocab, ISentence } from "../zhdb";
import { getOnlineSentence } from "../jukuu";
import XRegExp from "xregexp";
// @ts-ignore
import pinyinConverter from "chinese-to-pinyin";
import mustache from "mustache";
import templateMap, { ITemplate } from "./template/template";

export class TemplateResource {
    public static async get(templateName: string): Promise<ITemplate | null> {
        const m = new RegExp("^([^/]+)(?:/([^/]+))").exec(templateName);

        if (m) {
            if (m[1] === "v" && XRegExp("\\p{Han}").test(m[2])) {
                const vocab: string = m[2];
                const templateToken = await TemplateResource.fromVocab(vocab);

                for (const tNameRegex of Object.keys(templateMap)) {
                    const mTemplate = new RegExp(tNameRegex).exec(templateName);

                    if (mTemplate) {
                        const template = templateMap[tNameRegex];
                        const output = {} as any;

                        Object.keys(template).forEach((k) => {
                            output[k] = mustache.render((template as any)[k], {
                                v: templateToken.v[parseInt(mTemplate[1] || "0")],
                                s: templateToken.s,
                                m: mTemplate
                            });
                        });

                        return output as ITemplate;
                    }
                }
            }
        }

        return null;
    }

    public static async fromVocab(vocab: string) {
        const zhDb = Config.zhDb as ZhDb;

        let v: IVocab[] = zhDb.vocab!.chain().find({$or: [
            {simplified: vocab},
            {traditional: vocab}
        ]}).eqJoin(zhDb.token!, "simplified", "entry", (l, r) => {
            const {simplified, traditional, pinyin, english} = l;
            const {frequency, level} = r;
            return {simplified, traditional, pinyin, english, frequency, level};
        }).simplesort("frequency", true).data();

        if (v.length === 0) {
            v = [{
                simplified: vocab,
                pinyin: pinyinConverter(vocab)
            }];
            // zhDb.vocab!.insert(v);
        } else {
            const newV = v.filter((el) => {
                return (el.english ? !/^variant of/i.test(el.english) && !/^surname /i.test(el.english) : true &&
                el.pinyin[0] === el.pinyin[0].toLocaleLowerCase());
            });
            v = newV.length > 0 ? newV : v;
        }

        let s: ISentence[] = zhDb.sentence!.find({chinese: {$regex: XRegExp.escape(vocab)}}).slice(0, 10);

        if (s.length === 0) {
            s = await getOnlineSentence(vocab);
            s.forEach((el) => {
                try {
                    zhDb.sentence!.insertOne({
                        ...el,
                        source: "jukuu"
                    } as ISentence);
                } catch (e) {}
            });
        }

        return {v, s};
    }
}

export default TemplateResource;
