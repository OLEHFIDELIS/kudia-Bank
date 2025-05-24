import { Optional , Model } from "sequelize";

export interface IAccount {
    id: string;
    userId: string;
    accountNumber: string;
    balance: number;
    type: Date;  // SAVING_ACCOUNT, CURRENT_ACCOUNT, COPERATE (mostly the type of account determins the withdrawal amount, lower or high transaction fee)
    status: string; // ACTIVE, DOMANT, FROZEN, UNDER_REVIEW
    createdAt: Date;
    updatedAt: Date;
}

export interface IFindAccountQuery{
    where:  {
        [key: string]: string
    },
    raw?:  boolean;
    returning?: boolean;

}
export interface IAccountCreationBody extends Optional< IAccount, 'id' | 'createdAt' | 'updatedAt'> {}
export interface IAccountModel extends Model<IAccount, IAccountCreationBody>, IAccount{}
export interface IAccountDataSource{
    fetchOne(querry: IFindAccountQuery): Promise<IAccount | null>
    create(record: IAccountCreationBody): Promise<IAccount>;
    updateOne(searchBy: IFindAccountQuery, data: Partial<IAccount>): Promise<void>
}