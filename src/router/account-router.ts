import  express, {Request, Response} from "express";
import { Auth, validator } from "../middleware/index.middleware";
import ValidationSchema from "../validtors/account-validator-schema";
import AccountController from "../controllers/account-controller";
import AccountService from "../services/account-service";
import AccountDataSource from "../datasources/account-datasource";



const router = express.Router();
const accountService = new AccountService(new AccountDataSource());
const accountController = new AccountController(accountService);

const createAccountRoute = () => {

    router.post("/create-account",validator(ValidationSchema.createAccountSchema),Auth(), (req : Request , res : Response ) => {
       return accountController.createAccount(req, res);
    });

    return router;
};

export default createAccountRoute();