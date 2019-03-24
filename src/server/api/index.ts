import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import editorRouter from "./editor";
import templateRouter from "./template";
import deckRouter from "./deck";
import quizRouter from "./quiz";

export const router = Router();
router.use(cors());
router.use(bodyParser.json());

router.use("/editor", editorRouter);
router.use("/template", templateRouter);
router.use("/deck", deckRouter);
router.use("/quiz", quizRouter);

export default router;
