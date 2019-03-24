import { Request, Response, Router } from "express";
import XRegExp from "xregexp";
import Config from "../config";
import UserDb from "../userDb";
import moment from "moment";

class DeckController {
    public static filter(req: Request, res: Response): Response {
        const userDb: UserDb = Config.userDb;

        let cond: any = {};
        try {
            cond = Config.searchParser.search(req.body.q || "");
        } catch (e) {}

        if (req.body.deck) {
            cond.deck = {$regex: `${XRegExp.escape(req.body.deck)}(/.+)?`};
        }
        if (req.body.due) {
            const due: any[] = req.body.due;
            cond.nextReview = moment().add(due[0], due[1]).toDate();
        }

        const decks = userDb.card!.eqJoin(userDb.deck!, "deckId", "$loki", (l, r) => {
            const {front, back, note, tag, srsLevel, nextReview, vocab} = l;
            const deck = r.name;
            return {id: l.$loki, front, back, note, tag, srsLevel, nextReview, vocab, deck};
        }).find(cond).data().map((d) => d.deck);

        return res.json(decks.filter((d, i) => decks.indexOf(d) === i));
    }

    public static stat(req: Request, res: Response): Response {
        const userDb: UserDb = Config.userDb;

        let cond: any = {};
        try {
            cond = Config.searchParser.search(req.body.q || "");
        } catch (e) {}

        if (req.body.deck) {
            cond.deck = {$regex: `${XRegExp.escape(req.body.deck)}(/.+)?`};
        }
        if (req.body.due) {
            const due: any[] = req.body.due;
            cond.nextReview = moment().add(due[0], due[1]).toDate();
        }

        const cards = userDb.card!.eqJoin(userDb.deck!, "deckId", "$loki", (l, r) => {
            const {front, back, note, tag, srsLevel, nextReview, vocab} = l;
            const deck = r.name;
            return {id: l.$loki, front, back, note, tag, srsLevel, nextReview, vocab, deck};
        }).find(cond).data();

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
