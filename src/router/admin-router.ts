import express, { Request, Response } from 'express';
import UserController from '../controllers/user-controller';
import { AdminAuth, validator } from '../middleware/index.middleware';
import ValidationSchema from '../validators/user-validator-schema';
import AccountValidationSchema from '../validators/account-validator-schema';
import { container } from 'tsyringe';
import AccountController from '../controllers/account-controller';
import TransactionController from '../controllers/transaction-controller';

const router = express.Router();
const userController = container.resolve(UserController);
const accountController = container.resolve(AccountController);
const transactionController = container.resolve(TransactionController);

const createAdminRoute = () => {

  router.get('/users', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await userController.getAllUsersByAdmin(req, res);
  });

  router.get('/user/:id', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await userController.getSingleUserById(req, res);
  });

  router.post('/user/set-user-status', validator(ValidationSchema.setAccountStatusSchema), AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await userController.setAccountStatus(req, res);
  });

  router.get('/accounts', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getAllUserAccountsAdmin(req, res);
  });

  router.get('/account/:id', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getUserAccountAdmin(req, res);
  });

  router.get('/transactions', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.getAllUserTransactionsAdmin(req, res);
  });

  router.get('/loans', AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getLoansAdmin(req, res);
  });

  router.post('/loans/approve-decline-loan', validator(AccountValidationSchema.approveOrDeclineLoanSchema), AdminAuth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.approveOrDeclineLoanByAdmin(req, res);
  });

  return router;
};

export default createAdminRoute();