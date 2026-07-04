import 'reflect-metadata';
import { Request, Response } from 'express';
import Utility from '../utils/index.utils';
import { ResponseCode } from '../interfaces/enum/code-enum';
import AccountService from '../services/account-service';
import PaymentService from '../services/payment-service';
import TransactionService from '../services/transaction-service';
import { TransactionGateWay, TransactionStatus } from '../interfaces/enum/transaction-enum';
import sequelize from '../database';
import { IAccount } from '../interfaces/account-interface';
import { ITransaction } from '../interfaces/transaction-interface';
import PayeeService from '../services/payee-service';
import { autoInjectable } from 'tsyringe';
import Permissions from '../permission';

@autoInjectable()
class TransactionController {
  private transactionService: TransactionService;
  private accountService: AccountService;
  private payeeService: PayeeService;

  constructor(
    _transactionService: TransactionService,
    _accountService: AccountService,
    _payeeService: PayeeService,
  ) {
    this.transactionService = _transactionService;
    this.accountService = _accountService;
    this.payeeService = _payeeService;
  }

  private async deposit(accountId: string, transactionId: string, amount: number): Promise<boolean> {
    const tx = await sequelize.transaction();
    try {
      await this.accountService.topUpBalance(accountId, amount, { transaction: tx });
      await this.transactionService.setStatus(transactionId, TransactionStatus.COMPLETED, { transaction: tx });
      await tx.commit();
      return true;
    } catch (error) {
      await tx.rollback();
      return false;
    }
  }

  private async transfer(
    senderAccount: IAccount,
    receiverAccount: IAccount,
    amount: number,
  ): Promise<{ status: boolean; transaction: ITransaction | null }> {
    const tx = await sequelize.transaction();
    try {
      await this.accountService.topUpBalance(senderAccount.id, -amount, { transaction: tx });
      await this.accountService.topUpBalance(receiverAccount.id, amount, { transaction: tx });
      const newTransaction = {
        userId: senderAccount.userId,
        accountId: senderAccount.id,
        amount,
        detail: { recieverAccountNumber: receiverAccount.accountNumber },
      };
      const transfer = await this.transactionService.processInternalTransfer(newTransaction, { transaction: tx });
      await tx.commit();
      return { status: true, transaction: transfer };
    } catch (error) {
      await tx.rollback();
      return { status: false, transaction: null };
    }
  }

  private async transferToExternalAccount(
    senderAccount: IAccount,
    receiverAccountNumber: string,
    reference: string,
    amount: number,
  ): Promise<{ status: boolean; transaction: ITransaction | null }> {
    const tx = await sequelize.transaction();
    try {
      await this.accountService.topUpBalance(senderAccount.id, -amount, { transaction: tx });
      const newTransaction = {
        userId: senderAccount.userId,
        reference,
        accountId: senderAccount.id,
        amount,
        detail: {
          recieverAccountNumber: receiverAccountNumber,
          gateway: TransactionGateWay.PAYSTACK,
        },
      };
      const transfer = await this.transactionService.processExternalTransfer(newTransaction, { transaction: tx });
      await tx.commit();
      return { status: true, transaction: transfer };
    } catch (error) {
      await tx.rollback();
      return { status: false, transaction: null };
    }
  }

  async initiatePaystackDeposit(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const depositInfo = await PaymentService.generatePaystackPaymentUrl(params.user.email, params.amount);
      if (!depositInfo) {
        return Utility.handleError(res, 'Paystack payment not available, try again in a few seconds', ResponseCode.NOT_FOUND);
      }
      const newTransaction = {
        userId: params.user.id,
        accountId: params.accountId,
        amount: params.amount,
        reference: depositInfo.reference,
        detail: {},
      };
      const deposit = await this.transactionService.depositByPaystack(newTransaction);
      return Utility.handleSuccess(res, 'Transaction created successfully', { transaction: deposit, url: depositInfo.authorization_url }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async verifyPaystackDeposit(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const transaction = await this.transactionService.fetchTransactionByReference(params.reference);
      if (!transaction) {
        return Utility.handleError(res, 'Invalid transaction reference', ResponseCode.NOT_FOUND);
      }
      if (transaction.status !== TransactionStatus.IN_PROGRESS) {
        return Utility.handleError(res, 'Transaction status not supported', ResponseCode.BAD_REQUEST);
      }
      const isValidPaymentTx = await PaymentService.verifyPaystackPayment(params.reference, transaction.amount);
      if (!isValidPaymentTx) {
        return Utility.handleError(res, 'Invalid transaction reference', ResponseCode.NOT_FOUND);
      }
      const deposit = await this.deposit(transaction.accountId, transaction.id, transaction.amount);
      if (!deposit) {
        return Utility.handleError(res, 'Deposit failed', ResponseCode.SERVER_ERROR);
      }
      return Utility.handleSuccess(res, 'Deposit completed successfully', { transaction }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async internalTransfer(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      if (params.amount <= 0) {
        return Utility.handleError(res, 'Amount must be above zero', ResponseCode.BAD_REQUEST);
      }
      const senderAccount = await this.accountService.getAccountByField({ id: params.senderAccountId });
      if (!senderAccount) {
        return Utility.handleError(res, 'Invalid sender account', ResponseCode.NOT_FOUND);
      }
      if (senderAccount.balance < params.amount) {
        return Utility.handleError(res, 'Insufficient balance to complete this transfer', ResponseCode.BAD_REQUEST);
      }
      const receiverAccount = await this.accountService.getAccountByField({ accountNumber: params.recieverAccountNumber });
      if (!receiverAccount) {
        return Utility.handleError(res, 'Invalid receiver account', ResponseCode.NOT_FOUND);
      }
      if (senderAccount.userId === receiverAccount.userId) {
        return Utility.handleError(res, 'Cannot transfer to your own account', ResponseCode.BAD_REQUEST);
      }
      const result = await this.transfer(senderAccount, receiverAccount, params.amount);
      if (!result.status) {
        return Utility.handleError(res, 'Internal transfer failed', ResponseCode.SERVER_ERROR);
      }
      return Utility.handleSuccess(res, 'Transfer completed successfully', { transaction: result.transaction }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async withdrawByPaystack(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      if (params.amount <= 0) {
        return Utility.handleError(res, 'Amount must be above zero', ResponseCode.BAD_REQUEST);
      }
      const senderAccount = await this.accountService.getAccountByField({ id: params.senderAccountId });
      if (!senderAccount) {
        return Utility.handleError(res, 'Invalid sender account', ResponseCode.NOT_FOUND);
      }
      if (senderAccount.balance < params.amount) {
        return Utility.handleError(res, 'Insufficient balance to complete this transfer', ResponseCode.BAD_REQUEST);
      }

      let payeeRecord = await this.payeeService.fetchPayeeByAccountNumberAndBank(params.recieverAccountNumber, params.bankCode);
      let recipientID = '';

      if (!payeeRecord) {
        const paystackPayeeRecord = {
          accountNumber: params.recieverAccountNumber,
          accountName: params.receiverAccountName,
          bankCode: params.bankCode,
        };
        recipientID = (await PaymentService.createPaystackRecipient(paystackPayeeRecord)) as string;
        if (recipientID) {
          payeeRecord = await this.payeeService.savePayeeRecord({
            userId: params.user.id,
            accountNumber: params.recieverAccountNumber,
            accountName: params.receiverAccountName,
            bankCode: params.bankCode,
            detail: { paystackRecipientId: recipientID },
          });
        } else {
          return Utility.handleError(res, 'Invalid payment account, please try another payout method', ResponseCode.BAD_REQUEST);
        }
      } else {
        recipientID = payeeRecord.detail.paystackRecipientId as string;
      }

      const transferData = await PaymentService.initiatePaystackTransfer(recipientID, params.amount, params.message);
      if (!transferData) {
        return Utility.handleError(res, 'Paystack transfer failed', ResponseCode.BAD_REQUEST);
      }

      const result = await this.transferToExternalAccount(senderAccount, params.recieverAccountNumber, transferData.reference, params.amount);
      if (!result.status) {
        return Utility.handleError(res, 'Withdrawal transaction failed', ResponseCode.SERVER_ERROR);
      }
      return Utility.handleSuccess(res, 'Transfer initialized successfully', { transaction: result.transaction }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllUserTransactions(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const filter: Partial<ITransaction> = { userId: params.user.id };
      if (params.accountId) filter.accountId = params.accountId;
      const transactions = await this.transactionService.getTransactionsByField(filter);
      return Utility.handleSuccess(res, 'Transactions fetched successfully', { transactions }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getUserTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await this.transactionService.getTransactionByField({ id: Utility.escapeHtml(id) });
      if (!transaction) {
        return Utility.handleError(res, 'Transaction does not exist', ResponseCode.NOT_FOUND);
      }
      return Utility.handleSuccess(res, 'Transaction fetched successfully', { transaction }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllUserTransactionsAdmin(req: Request, res: Response) {
    try {
      const admin = { ...req.body.user };
      // .granted is the correct property on an AccessControl Permission object
      const permission = Permissions.can(admin.role).readAny('transactions');
      if (!permission.granted) {
        return Utility.handleError(res, 'Invalid Permission', ResponseCode.UNAUTHORIZED);
      }
      const transactions = await this.transactionService.getTransactionsByField({});
      return Utility.handleSuccess(res, 'Transactions fetched successfully', { transactions }, ResponseCode.SUCCESS);
    } catch (error) {
      return Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }
}

export default TransactionController;