import Db from "./index";
import UserModel from "../models/user-model";
import TokenModel from "../models/token-model"

const DbInitailize = async () => {
    try{
       await Db.authenticate();
       UserModel.sync({ alter: false });
       TokenModel.sync({ alter: false })
    }catch(error){
        console.log("unable to connect to our database ", error)
    }
}

export default  DbInitailize;