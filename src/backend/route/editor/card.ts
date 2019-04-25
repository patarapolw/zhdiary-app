import { Request, Response, Router } from "express";
import SearchResource from "../../db/SearchResource";
import asyncHandler from "express-async-handler";
import Config from "../../config";
import { mongoToFilter } from "../../db/MongoQParser";

class EditorController {
    public static find(req: Request, res: Response): Response {
        const rSearch = new SearchResource();
        const cond = rSearch.parse(req.body.q);
        cond.cardId = { $exists: true };
        const filter = mongoToFilter(cond);

        const offset: number = req.body.offset;
        const limit: number = req.body.limit;
        const sortBy: string = req.body.sortBy || "front";
        const desc: boolean = req.body.desc || false;

        return res.json({
            data: rSearch.getQuery().filter(filter).sort((a, b) => {
                function convert(x: any) {
                    let s = x[sortBy];
                    if (s === undefined) {
                        s = -Infinity;
                    }
                    return s;
                }

                function compare() {
                    const m = convert(a);
                    const n = convert(b);
                    if (typeof m === "string" && typeof n === "string") {
                        return m.localeCompare(n);
                    } else if (typeof m === "string") {
                        return 1;
                    } else if (typeof n === "string") {
                        return -1;
                    } else {
                        return m - n;
                    }
                }

                return desc ? -compare() : compare();
            }).slice(offset, offset + limit).map((c) => {
                delete c.id;
                c.id = c.cardId;
                return c;
            }),
            count: rSearch.getQuery().filter(filter).length
        });
    }

    public static findOne(req: Request, res: Response): Response {
        const db = Config.userDb!;

        const $loki: number = req.body.id;
        const card = db.card.findOne({ $loki });

        return res.json(card);
    }

    public static async create(req: Request, res: Response): Promise<Response> {
        const db = Config.userDb!;
        const vocab: string | string[] = req.body.create;
        const $loki = (await db.create(Config.zhDb!, typeof vocab === "string" ? [vocab] : vocab))[0];

        return res.json({ id: $loki });
    }

    public static async update(req: Request, res: Response): Promise<Response> {
        if (req.body.create) {
            return EditorController.create(req, res);
        }

        const db = Config.userDb!;
        const id: number = req.body.id;

        if (req.body.update) {
            const u = req.body.update;
            db.update({
                $loki: id,
                ...u
            });
        } else {
            const fieldName: string = req.body.fieldName;
            const fieldData: any = req.body.fieldData;
            db.update({
                $loki: id,
                [fieldName]: fieldData
            });
        }

        return res.sendStatus(201);
    }

    public static delete(req: Request, res: Response): Response {
        const id: number = req.body.id;
        const db = Config.userDb!;
        db.card.removeWhere((c) => c.$loki === id);

        return res.sendStatus(201);
    }
}

export const router = Router();

router.post("/", EditorController.find);
router.post("/findOne", EditorController.findOne);
router.post("/create", asyncHandler(EditorController.create));
router.put("/", asyncHandler(EditorController.update));
router.delete("/", EditorController.delete);

export default router;
