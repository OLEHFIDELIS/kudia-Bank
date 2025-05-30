import  express, {Request, Response} from "express";
import UserController from "../controllers/user-controller";
import UserService from "../services/user-service";
import { validator } from "../middleware/index.middleware";
import ValidationSchema from "../validtors/user-validator-schema";
import UserDataSource from "../datasources/user-datasousrce";
import TokenService from "../services/token-service";
import TokenDataSource from "../datasources/token-datasource";

const router = express.Router();
const tokenService = new TokenService(new TokenDataSource());
export const userService = new UserService(new UserDataSource());
const userController = new UserController(userService, tokenService);

const createUserRoute = () => {

    
    router.post("/register",validator(ValidationSchema.registerSchema), (req : Request , res : Response )=> {
        userController.register(req, res);
    });

    router.post("/login",validator(ValidationSchema.loginSchema), (req : Request , res : Response )=> {
        userController.login(req, res);
    });

    router.post("/forgot-password",validator(ValidationSchema.forgotPasswordSchema), (req : Request , res : Response )=> {
        userController.forgotPassword(req, res);
    });

    router.post("/reset-password",validator(ValidationSchema.resetPasswordSchema), (req : Request , res : Response )=> {
        userController.resetPassword(req, res);
    });

    return router;
};

export default createUserRoute();