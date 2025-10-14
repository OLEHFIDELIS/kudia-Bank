import { Schema, string } from "yup";
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


export const Auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let token:string = req.headers.authorization ?? '';
            if(Utility.isEmpty(token)){
                throw new TypeError("Authorization failed")
            }
            token = token.split(" ")[1];
            const decoded = Jwt.verify(token, process.env.JWT_KEY as  string) as IUser;
            if(decoded && decoded.id){
               const user = await userService.getuserByField({id: decoded.id});
               if(!user){
                throw new TypeError("Authorization failed")
               }

               if(user.accountStatus == "DELETED"){
                throw new TypeError("Authorization failed")
               }
               req.body.user = decoded;
               next();
            }else{
               throw new TypeError("Authorization failed") 
            }
        } catch (error) {
            Utility.handleError(res, (error as TypeError).message, ResponseCode.BAD_REQUEST);
        
        }
    }
};

// export const Auth = () => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       let token: string | undefined = req.headers.authorization;
//       if (!token) {
//         throw new TypeError("Authorization failed");
//       }

//       token = token.split(" ")[1]; // "Bearer <token>"
//       const decoded = Jwt.verify(token, process.env.JWT_KEY as string) as IUser;

//       if (!decoded || !decoded.id) {
//         throw new TypeError("Authorization failed");
//       }

//       const user = await userService.getuserByField({ id: decoded.id });
//       if (!user || user.accountStatus === "DELETED") {
//         throw new TypeError("Authorization failed");
//       }

//       // attach user safely
//       (req as any).user = decoded;
//       next();
//     } catch (error) {
//       Utility.handleError(res, (error as Error).message, ResponseCode.BAD_REQUEST);
//     }
//   };
// };
