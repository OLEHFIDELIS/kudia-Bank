import { Schema } from "yup";
import { NextFunction, Request, Response, RequestHandler } from "express";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code-enum";


export const validator = (schema: Schema<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validate(req.body, {abortEarly: false});
            next();
        } catch (error: any) {
            Utility.handleError(res, error.errors[0], ResponseCode.BAD_REQUEST);
        }
    }
};