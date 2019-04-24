import { Request, Response, Router } from "express";
import XRegExp from "xregexp";
import asyncHandler from "express-async-handler";
import QuizResource from "../db/QuizResource";
import SearchResource from "../db/SearchResource";
import Config from "../config";
import moment from "moment";
import { mongoToFilter } from "../db/MongoQParser";

interface ITreeViewStat {
    new: number;
    leech: number;
    due: number;
}

export interface ITreeViewItem {
    name: string;
    fullName: string;
    isOpen: boolean;
    children?: ITreeViewItem[];
    stat: ITreeViewStat;
}

class QuizController {
    public static treeview(req: Request, res: Response): Response {
        function recurseParseData(data: ITreeViewItem[], deck: string[], _depth = 0) {
            let doLoop = true;

            while (_depth < deck.length - 1) {
                for (const c of data) {
                    if (c.name === deck[_depth]) {
                        c.children = c.children || [];
                        recurseParseData(c.children, deck, _depth + 1);
                        doLoop = false;
                        break;
                    }
                }

                _depth++;

                if (!doLoop) {
                    break;
                }
            }

            if (doLoop && _depth === deck.length - 1) {
                const fullName = deck.join("/");
                // const thisDeckData = deckData.filter((d) => new RegExp(`^${XRegExp.escape(fullName)}`).test(d.deck));
                let thisDeckData: any[] = [];
                if (fullName === "pool") {
                    thisDeckData = deckData;
                } else if (/^HSK/.test(fullName)) {
                    const [_, tag] = fullName.split("/");
                    thisDeckData = deckData.filter((d) => d.tag && d.tag.indexOf(tag) !== -1);
                }

                data.push({
                    name: deck[_depth],
                    fullName,
                    isOpen: _depth < 2,
                    stat: {
                        new: thisDeckData.filter((d) => !d.nextReview).length,
                        leech: thisDeckData.filter((d) => d.srsLevel === 0).length,
                        due: thisDeckData.filter((d) => d.nextReview && moment(d.nextReview).toDate() < now).length
                    }
                });
            }
        }

        const rSearch = new SearchResource();
        const cond = rSearch.parse(req.body.q);

        const deckData = rSearch.getQuery().find(cond).data();

        const now = new Date();

        const deckList: string[] = [
            "pool",
            "HSK/HSK1",
            "HSK/HSK2",
            "HSK/HSK3",
            "HSK/HSK4",
            "HSK/HSK5",
            "HSK/HSK6"
        ];
        const deckWithSubDecks: string[] = [];

        deckList.filter((d, i) => deckList.indexOf(d) === i).sort().forEach((d) => {
            const deck = d.split("/");
            deck.forEach((seg, i) => {
                const subDeck = deck.slice(0, i + 1).join("/");
                if (deckWithSubDecks.indexOf(subDeck) === -1) {
                    deckWithSubDecks.push(subDeck);
                }
            });
        });

        const fullData = [] as ITreeViewItem[];
        deckWithSubDecks.forEach((d) => {
            const deck = d.split("/");
            recurseParseData(fullData, deck);
        });

        return res.json(fullData);
    }

    public static build(req: Request, res: Response): Response {
        const search = new SearchResource();
        let cond = search.parse(req.body.q);

        if (req.body.deck) {
            const deckName = req.body.deck;

            if (deckName === ".Pool") {

            } else if (/^HSK/.test(deckName)) {
                const [_, tag] = deckName.split("/");
                cond.tag = tag;
            } else {
                cond.deck = {$regex: `${XRegExp.escape(req.body.deck)}(/.+)?`};
            }
        }

        cond = {$and: [
            cond,
            {$or: [
                {nextReview: {$exists: false}},
                {nextReview: {$in: [null, ""]}},
                {nextReview: {$lt: new Date()}}
            ]}
        ]};

        const cards = search.getQuery().where(mongoToFilter(cond)).data().map((c) => {
            return {
                id: c.cardId,
                entry: c.entry
            };
        });

        return res.json(cards);
    }

    public static async render(req: Request, res: Response): Promise<Response> {
        const db = Config.userDb!;

        let $loki: number;
        if (req.body.id) {
            $loki = req.body.id;
        } else {
            const entry: string = req.body.entry;

            $loki = (await db.create(Config.zhDb!, [entry]))[0];
        }

        const card = db.card.find({$loki}).map((c) => {
            const {front, back} = c;
            return {id: $loki, front, back};
        });

        return res.json(card[0]);
    }

    public static right(req: Request, res: Response): Response {
        const db = Config.userDb!;
        const $loki = req.body.id;

        db.card.find({$loki}).forEach((c) => {
            c.srsLevel = (c.srsLevel || 0) + 1;
            if (c.srsLevel >= QuizResource.srsMap.length) {
                c.srsLevel = QuizResource.srsMap.length - 1;
            }
            c.nextReview = QuizResource.getNextReview(c.srsLevel);
            db.card.updateWhere((c0) => c0.$loki === $loki, (c0) => {
                return Object.assign(c0, {
                    srsLevel: c.srsLevel,
                    nextReview: c.nextReview,
                    modified: new Date()
                });
            });
        });

        return res.sendStatus(201);
    }

    public static wrong(req: Request, res: Response): Response {
        const db = Config.userDb!;
        const $loki = req.body.id;

        db.card.find({$loki}).forEach((c) => {
            c.srsLevel = (c.srsLevel || 0) - 1;
            if (c.srsLevel < 0) {
                c.srsLevel = 0;
            }
            c.nextReview = QuizResource.repeat();
            db.card.updateWhere((c0) => c0.$loki === $loki, (c0) => {
                return Object.assign(c0, {
                    srsLevel: c.srsLevel,
                    nextReview: c.nextReview,
                    modified: new Date()
                });
            });
        });

        return res.sendStatus(201);
    }
}

const router = Router();

router.post("/", asyncHandler(QuizController.build));
router.post("/treeview", QuizController.treeview);
router.post("/render", asyncHandler(QuizController.render));
router.put("/right", QuizController.right);
router.put("/wrong", QuizController.wrong);

export default router;
