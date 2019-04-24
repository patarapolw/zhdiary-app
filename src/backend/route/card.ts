import { Router } from "express";
import cardEditorRouter from "./editor/card";

export const router = Router();

router.use("/editor", cardEditorRouter);

export default router;
