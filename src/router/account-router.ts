import express, { Request, Response } from 'express';
import { Auth, validator } from '../middleware/index.middleware';
import ValidationSchema from '../validators/account-validator-schema';
import AccountController from '../controllers/account-controller';
import { container } from 'tsyringe';

const router = express.Router();
const accountController = container.resolve(AccountController);

const createAccountRoute = () => {

  router.post('/create-account', validator(ValidationSchema.createAccountSchema), Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.createAccount(req, res);
  });

  router.get('/account-list', Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getAllUserAccounts(req, res);
  });

  router.get('/payee/list', Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getAllUserPayee(req, res);
  });

  router.get('/payee/:id', Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getUserPayee(req, res);
  });

  router.post('/apply-for-loan', validator(ValidationSchema.loanApplication), Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.applyLoan(req, res);
  });

  router.get('/loan/list', Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getAllUserLoan(req, res);
  });

  router.get('/:id', Auth(), async (req: Request, res: Response): Promise<void> => {
    await accountController.getUserAccount(req, res);
  });

  return router;
};

export default createAccountRoute();