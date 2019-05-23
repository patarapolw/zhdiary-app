// import jieba from "nodejieba";
import { Router, Request, Response } from "express";

class JiebaController {
    public static cut(req: Request, res: Response): Response {
        const entry: string = req.body.entry;

        return res.json([entry]);
    }
}

const router = Router();

router.post("/", JiebaController.cut);

export default router;
