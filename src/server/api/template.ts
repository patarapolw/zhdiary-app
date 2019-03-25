import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import TemplateResource from "../userDb/TemplateResource";
import { ITemplate } from "../userDb/template/template";

export class TemplateController {
    public static async get(req: Request, res: Response): Promise<Response> {
        const templateName: string = req.body.template;
        const template: ITemplate | null = await TemplateResource.get(templateName);

        return res.json(template);
    }
}

export const router = Router();

router.post("/", asyncHandler(TemplateController.get));

export default router;
