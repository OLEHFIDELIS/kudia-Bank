import { configDotenv } from "dotenv";
import * as yup from "yup";
import { AccountTypes } from "../interfaces/enum/account-enum";


const createAccountSchema = yup.object({
    type: yup.string().trim().required().oneOf(Object.values(AccountTypes)),
    email: yup.string().email().lowercase().trim().required(),
    password: yup.string().min(6).trim().required()
});

const ValidationSchema = {
    createAccountSchema
};
 
export default ValidationSchema;
