import Db from "./index";
import UserModel from "../models/user-model";
import TokenModel from "../models/token-model"
import AccountModel from "../models/account-model";

const DbInitailize = async () => {
    try{
       await Db.authenticate();
       UserModel.sync({ alter: false });
       TokenModel.sync({ alter: false });
       AccountModel.sync({ alter: false });
    }catch(error){
        console.log("unable to connect to our database ", error)
    }
}

export default  DbInitailize;