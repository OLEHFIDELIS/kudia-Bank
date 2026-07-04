import {Request, Response} from "express";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code-enum";
import AccountService from "../services/account-service";


class AccountController{
    private accountService: AccountService;


    constructor(_accountService: AccountService){
        this.accountService =  _accountService;
    }


    async createAccount(req: Request, res: Response): Promise<void> {
        try {
            const params = {...req.body};
            const newAccount = {
                userId: params.user.id,
                type: params.type
            }

            const account = await this.accountService.createAccount(newAccount);
            Utility.handleSuccess(res, "Account created successfully", {account}, ResponseCode.SUCCSESS);
        } catch (error) {
            console.error(error);
            Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
        }
    };
   
}



export default AccountController;