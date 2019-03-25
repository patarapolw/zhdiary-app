import { Request, Response, Router } from "express";
import XRegExp from "xregexp";
import Config from "../config";
import moment from "moment";
import { getQuery } from "../userDb/SearchResource";

class DeckController {
    public static filter(req: Request, res: Response): Response {
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

        const decks = getQuery().find(cond).data().map((d) => d.deck);

        return res.json(decks.filter((d, i) => decks.indexOf(d) === i));
    }

    public static stat(req: Request, res: Response): Response {
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

        const now = new Date();

        return res.json({
            new: cards.filter((c) => !c.nextReview).length,
            due: cards.filter((c) => c.nextReview && moment(c.nextReview).toDate() < now).length,
            leech: cards.filter((c) => c.srsLevel === 0).length
        });
    }
}

const router = Router();

router.post("/filter", DeckController.filter);
router.post("/stat", DeckController.stat);

export default router;
