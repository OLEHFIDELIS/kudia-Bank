import Db from "../database/index";
import { IUserModel } from "../interfaces/user-interface";
import { DataType, DataTypes } from "sequelize";
import {v4 as uuidv4} from "uuid";

const userModel = Db.define<IUserModel>(
    "userModel",{
        id: {
           type: DataTypes.UUID,
           defaultValue: ()=> uuidv4(),
           allowNull: false,
           primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true 
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true 
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isEmailverified: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }
)