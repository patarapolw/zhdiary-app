import { Request, Response, Router } from "express";
import Config from "../config";
import UserDb from "../userDb";
import moment from "moment";
import { getQuery } from "../userDb/SearchResource";

class EditorController {
    public static find(req: Request, res: Response): Response {
        let cond: any = {};
        try {
            cond = Config.searchParser.search(req.body.q || "");
        } catch (e) {}

        const offset: number = req.body.offset;
        const limit: number = req.body.limit;

        const q = getQuery().find(cond).compoundsort([["deck", false], ["srsLevel", false]]);

        return res.json({
            data: q.offset(offset).limit(limit).data(),
            total: q.copy().count()
        });
    }

    public static create(req: Request, res: Response): Response {
        const userDb = Config.userDb as UserDb;
        const {deck, ...c} = req.body.create;

        let deckId: number;
        try {
            deckId = userDb.deck!.findOne({name: deck})!.$loki;
        } catch (e) {
            deckId = userDb.deck!.insertOne({name: deck})!.$loki;
        }

        return res.json({
            id: userDb.card!.insertOne({deckId, ...c})!.$loki
        });
    }

    public static update(req: Request, res: Response): Response {
        if (req.body.create) {
            return EditorController.create(req, res);
        }

        const userDb = Config.userDb as UserDb;

        const id: number = req.body.id;

        if (req.body.update) {
            const {deck, ...x} = req.body.update;

            let deckId: number;
            try {
                deckId = userDb.deck!.findOne({name: deck})!.$loki;
            } catch (e) {
                deckId = userDb.deck!.insertOne({name: deck})!.$loki;
            }

            userDb.card!.updateWhere((c) => c.$loki === id, (c) => {
                return Object.assign(c, {deckId, ...x});
            });
        } else {
            let fieldName: string = req.body.fieldName;
            let fieldData: any = req.body.fieldData;

            switch (fieldName) {
                case "deck":
                    try {
                        fieldData = userDb.deck!.findOne({name: fieldData})!.$loki;
                    } catch (e) {
                        fieldData = userDb.deck!.insertOne({name: fieldData})!.$loki;
                    }
                    fieldName = "deckId";
                    break;
                case "nextReview":
                    if (!moment(fieldData).isValid()) {
                        throw new Error("Invalid date");
                    }
                    fieldData = moment(fieldData).toDate();
                    break;
                case "srsLevel":
                    fieldData = parseInt(fieldData);
                    break;
            }

            userDb.card!.updateWhere((c) => c.$loki === id, (c) => {
                (c as any)[fieldName] = fieldData;
                return c;
            });
        }

        return res.sendStatus(201);
    }

    public static delete(req: Request, res: Response): Response {
        const id: number = req.body.id;
        const userDb = Config.userDb as UserDb;
        userDb.card!.removeWhere((c) => c.$loki === id);

        return res.sendStatus(201);
    }
}

export const router = Router();

router.post("/", EditorController.find);
router.post("/create", EditorController.create);
router.put("/", EditorController.update);
router.delete("/", EditorController.delete);

export default router;
