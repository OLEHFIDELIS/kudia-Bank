import express, { Request, Response } from 'express';
import UserController from '../controllers/user-controller';
import { Auth, validator } from '../middleware/index.middleware';
import ValidationSchema from '../validators/user-validator-schema';
import { container } from 'tsyringe';

const router = express.Router();
const userController = container.resolve(UserController);

const createUserRoute = () => {

  router.post('/register', validator(ValidationSchema.registerSchema), async (req: Request, res: Response): Promise<void> => {
    await userController.register(req, res);
  });

  router.post('/login', validator(ValidationSchema.loginSchema), async (req: Request, res: Response): Promise<void> => {
    await userController.login(req, res);
  });

  router.post('/forgot-password', validator(ValidationSchema.forgotPasswordSchema), async (req: Request, res: Response): Promise<void> => {
    await userController.forgotPassword(req, res);
  });

  router.post('/reset-password', validator(ValidationSchema.resetPasswordSchema), async (req: Request, res: Response): Promise<void> => {
    await userController.resetPassword(req, res);
  });

  router.get('/profile', Auth(), async (req: Request, res: Response): Promise<void> => {
    await userController.getProfile(req, res);
  });

  return router;
};

export default createUserRoute();