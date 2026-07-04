import express, { Request, Response } from 'express';
import { Auth, validator } from '../middleware/index.middleware';
import ValidationSchema from '../validators/transaction-validator-schema';
import TransactionController from '../controllers/transaction-controller';
import { container } from 'tsyringe';

const router = express.Router();
const transactionController = container.resolve(TransactionController);

const createTransactionRoute = () => {

  router.post('/initiate-paystack-deposit', validator(ValidationSchema.initiatePaystackDeposit), Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.initiatePaystackDeposit(req, res);
  });

  router.post('/verify-paystack-deposit', validator(ValidationSchema.verifyPaystackDeposit), Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.verifyPaystackDeposit(req, res);
  });

  router.post('/make-transfer', validator(ValidationSchema.makeInternalTransferSchema), Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.internalTransfer(req, res);
  });

  router.post('/make-withdrawal-by-paystack', validator(ValidationSchema.makeWithdrawalByPaystack), Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.withdrawByPaystack(req, res);
  });

  router.get('/list', Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.getAllUserTransactions(req, res);
  });

  router.get('/:id', Auth(), async (req: Request, res: Response): Promise<void> => {
    await transactionController.getUserTransaction(req, res);
  });

  return router;
};

export default createTransactionRoute();
