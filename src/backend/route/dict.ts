import { Router, Request, Response } from "express";
import Config from "../config";

class DictController {
    public static radical(req: Request, res: Response): Response {
        const entry: string = req.body.entry;
        const db = Config.zhDb!;

        const r = db.token.findOne({name: entry})

        return res.json({
            sub: r.sub,
            sup: r.sup,
            var: r.var
        });
    }

    public static vocab(req: Request, res: Response): Response {
        const entry: string = req.body.entry;
        const db = Config.zhDb!;

        const regex = new RegExp(entry);
        let r = db.vocab.chain().find({$or: [
            {simplified: {$regex: regex}},
            {traditional: {$regex: regex}}
        ]}).eqJoin(db.token, "simplified", "name", (l, r) => {
            delete l.meta;
            delete l.$loki;
            return {...l, frequency: r.frequency}
        }).simplesort("frequency", true).data();

        return res.json(r.splice(0, 10));
    }

    public static vocabListMatch(req: Request, res: Response): Response {
        const vocabList: string[] = req.body.vocabList;
        const db = Config.zhDb!;

        let r = db.vocab.find({$or: vocabList.map((v) => {
            return {$or: [
                {simplified: v},
                {traditional: v}
            ]};
        })})

        if (!Array.isArray(r)) {
            r = [r];
        }

        return res.json(r);
    }

    public static sentence(req: Request, res: Response): Response {
        const entry: string = req.body.entry;
        const db = Config.zhDb!;

        let r = db.sentence.find({chinese: {$regex: new RegExp(entry)}})

        if (!Array.isArray(r)) {
            r = [r];
        }

        return res.json(r.splice(0, 10));
    }
}

const router = Router();

router.post("/radical", DictController.radical);
router.post("/vocab", DictController.vocab);
router.post("/vocab/match", DictController.vocabListMatch);
router.post("/sentence", DictController.sentence);

export default router;
