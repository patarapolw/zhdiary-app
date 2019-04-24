// import { Router, Request, Response } from "express";
// import fs from "fs";
// import path from "path";
// import needUserId from "../middleware/needUserId";
// import asyncHandler from "express-async-handler";
// import SearchResource from "../db/SearchResource";
// import XRegExp from "xregexp";

// class IoController {
//     public static async lokiExport(req: Request, res: Response) {
//         const search = new SearchResource();
//         const cond = search.parse(req.body.q);

//         if (req.body.deck) {
//             cond.deck = {$regex: `${XRegExp.escape(req.body.deck)}(/.+)?`};
//         }

//         const fileId = uuid();
//         try {
//             fs.mkdirSync(path.join("tmp", fileId), {recursive: true});
//         } catch (e) {}

//         const lkFilename = path.join("tmp", fileId, sanitize(req.body.deck) + ".r2r");
//         const lk = await LokiDb.connect(lkFilename);

//         lk.fromMongo(res.locals.userId, cond, (s: any) => {
//             console.log(s);
//         });

//         await lk.loki.close();

//         return res.download(lkFilename);
//     }
// }

// const router = Router();
// router.use(needUserId());
// router.post("/export/loki", asyncHandler(IoController.lokiExport));

// export default router;
