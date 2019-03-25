import { Request, Response, Router } from "express";
import XRegExp from "xregexp";
import moment from "moment";
import QuizResource from "../userDb/QuizResource";
import Config from "../config";
import UserDb from "../userDb";
import { getQuery } from "../userDb/SearchResource";

class QuizController {
    public static build(req: Request, res: Response): Response {
        let cond: any = {};
        try {
            cond = Config.searchParser.search(req.body.q || "");
        } catch (e) {}

        if (req.body.deck) {
            cond.deck = {$regex: `${XRegExp.escape(req.body.deck)}(/.+)?`};
        }
        if (req.body.due) {
            const due: any[] = req.body.due;
            cond.nextReview = {$and: [
                {$exists: true},
                {$lt: moment().add(due[0], due[1]).toDate()}
            ]};
        }

        const cards = getQuery().find(cond).data();

        return res.json(cards.map((c) => c.id));
    }

    public static render(req: Request, res: Response): Response {
        const db = Config.userDb!;
        const id: number = req.body.id;

        const card = db.card.findOne({$loki: id});

        return res.json(card);
    }

    public static right(req: Request, res: Response): Response {
        const db: UserDb = Config.userDb;
        const id: number = req.body.id;

        db.card!.updateWhere((c) => c.$loki === id, (c) => {
            c.srsLevel = (c.srsLevel || 0) + 1;
            if (c.srsLevel >= QuizResource.srsMap.length) {
                c.srsLevel = QuizResource.srsMap.length - 1;
            }
            c.nextReview = QuizResource.getNextReview(c.srsLevel);

            return c;
        });

        return res.sendStatus(201);
    }

    public static wrong(req: Request, res: Response): Response {
        const db: UserDb = Config.userDb;
        const id: number = req.body.id;

        db.card!.updateWhere((c) => c.$loki === id, (c) => {
            c.srsLevel = (c.srsLevel || 0) - 1;
            if (c.srsLevel < 0) {
                c.srsLevel = 0;
            }
            c.nextReview = QuizResource.repeat();

            return c;
        });

        return res.sendStatus(201);
    }
}

const router = Router();

router.post("/", QuizController.build);
router.post("/render", QuizController.render);
router.put("/right", QuizController.right);
router.put("/wrong", QuizController.wrong);

export default router;
