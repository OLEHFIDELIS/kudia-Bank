import bcrypt from "bcryptjs"
import  {Request, Response} from "express";
import { AccountStatus, EmailStatus, UserRoles } from "../interfaces/enum/user-enum";
import { IUserCreationBody } from "../interfaces/user-interface";
import UserService from "../services/user-service";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code-enum";


class UserController{
    
    private userService: UserService
    constructor(_userService: UserService){
        this.userService =  _userService;
    }

    //-- structure the data
    //-- hash the password 
    //-- create user
    //-- generate a token for verification 
    //-- send the welcome/verification email

    async register(req: Request, res: Response){

        try {
            const params = {...req.body};
            const newUser = {
                firstname: params.firstname,
                lastname: params.lastname,
                email: params.email,
                username: params.email.split("@")[0],
                password: params.Password,
                role: UserRoles.CUSTOMER,
                isEmailVerified: EmailStatus.NO_TVERIFIED,
                accountStatus: AccountStatus.ACTIVE,
            }as  IUserCreationBody;
            newUser.password = bcrypt.hashSync(newUser.password, 10 );

            let userExist = await this.userService.getUserByField({email: newUser.email});

            if(userExist){
                return Utility.handleError(res, "Email already exists", ResponseCode.ALREADY_EXIST);
            };

            let user = await this.userService.createUser(newUser);
            user.password = "";
            return Utility.handleSuccess(res, "User registered successfuly", {user}, ResponseCode.SUCCSESS)
        } catch (error) {
            res.send({ message: "Server Error" })
        }
    };

    async login(req: Request, res: Response){
        try {
            res.send({ message: "Login Successful" })
        } catch (error) {
            res.send({ message: "Server Error" })
        }
    };

    async forgotPassword(req: Request, res: Response){
        try {
            res.send({ message: "Forgot Password mail sent " })
        } catch (error) {
            res.send({ message: "Server Error" })
        }
    };

    async resetPassword(req: Request, res: Response){
        try {
            res.send({ message: "Reset password successful" })
        } catch (error) {
            res.send({ message: "Server Error" })
        }
    };


}


export default UserController;