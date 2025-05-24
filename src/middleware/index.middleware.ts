import { Schema } from "yup";
import { NextFunction, Request, Response, RequestHandler } from "express";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code-enum";
import Jwt from 'jsonwebtoken'
import { IUser } from "../interfaces/user-interface";
import {userService} from "../router/user-router";  // update path


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



export const auth = ()  => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new TypeError("Authorization failed");
            }

            const token = authHeader.split(" ")[1];
            const decoded = Jwt.verify(token, process.env.JWT_KEY as string) as IUser;

            if (!decoded?.id) {
                throw new TypeError("Authorization failed");
            }

            const user = await userService.getuserByField({ id: decoded.id });

            if (!user || user.accountStatus === "DELETED") {
                throw new TypeError("Authorization failed");
            }

            (req as any).user = decoded; // ideally extend the Request type
            next();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Internal Server Error";
            return Utility.handleError(res, message, ResponseCode.BAD_REQUEST);
        }
    };
};

export const Auth = (): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new TypeError("Authorization failed");
            }

            const token = authHeader.split(" ")[1];
            const decoded = Jwt.verify(token, process.env.JWT_KEY as string) as IUser;

            if (!decoded?.id) {
                throw new TypeError("Authorization failed");
            }

            const user = await userService.getuserByField({ id: decoded.id });

            if (!user || user.accountStatus === "DELETED") {
                throw new TypeError("Authorization failed");
            }

            (req as any).user = decoded;
            next();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Internal Server Error";
            return Utility.handleError(res, message, ResponseCode.UNAUTHORIZED);
        }
    };
};