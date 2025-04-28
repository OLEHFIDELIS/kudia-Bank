import { IFindUserQuery, IUser, IUserDataSource, IUserCreationBody } from "../interfaces/user-interface";
import UserModel from "../models/user-model";

class UserDataSource implements IUserDataSource  {

    async create(record: IUserCreationBody): Promise<IUser>{
        return await UserModel.create(record);
    }
    
    async fetchOne(querry: IFindUserQuery): Promise<IUser | null> {
        return await UserModel.findOne(querry);
    }
}

export default UserDataSource;