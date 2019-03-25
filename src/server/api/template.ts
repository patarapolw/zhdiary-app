import { Request, Response, Router } from "express";
import Config from "../config";
import ZhDb, { ISentence, IVocab } from "../zhdb";
import XRegExp from "xregexp";
import { getOnlineSentence } from "../jukuu";
import asyncHandler from "express-async-handler";
// @ts-ignore
import pinyinConverter from "chinese-to-pinyin";

export class TemplateController {
    public static async get(req: Request, res: Response): Promise<Response> {
        const vocab: string = req.body.vocab;
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
            zhDb.vocab!.insert(v);
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

        return res.json({v, s});
    }
}

export const router = Router();

router.post("/", asyncHandler(TemplateController.get));

export default router;
