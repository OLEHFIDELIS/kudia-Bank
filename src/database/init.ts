import Db from './index';
import UserModel from '../models/user-model';
import TokenModel from '../models/token-model';
import AccountModel from '../models/account-model';
import TransactionModel from '../models/transaction-model';
import PayeeModel from '../models/payee-model';
import LoanModel from '../models/loan-model';

const DbInitialize = async () => {
  try {
    await Db.authenticate();
    console.log('Connection has been established successfully.');
    await UserModel.sync({ alter: false });
    await TokenModel.sync({ alter: false });
    await AccountModel.sync({ alter: false });
    await TransactionModel.sync({ alter: false });
    await PayeeModel.sync({ alter: false });
    await LoanModel.sync({ alter: false });
    console.log('All models synced successfully.');
  } catch (error) {
    console.log('Unable to connect to our database:', error);
  }
};

export default DbInitialize;
