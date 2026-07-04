import 'reflect-metadata';
import { Request, Response } from 'express';
import Utility from '../utils/index.utils';
import { ResponseCode } from '../interfaces/enum/code-enum';
import AccountService from '../services/account-service';
import LoanService from '../services/loan-service';
import PayeeService from '../services/payee-service';
import { autoInjectable } from 'tsyringe';
import { LoanInterest, LoanStatus } from '../interfaces/enum/loan-enum';

@autoInjectable()
class AccountController {
  private accountService: AccountService;
  private loanService: LoanService;
  private payeeService: PayeeService;

  constructor(
    _accountService: AccountService,
    _loanService: LoanService,
    _payeeService: PayeeService,
  ) {
    this.accountService = _accountService;
    this.loanService = _loanService;
    this.payeeService = _payeeService;
  }

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const account = await this.accountService.createAccount({ userId: params.user.id, type: params.type });
      Utility.handleSuccess(res, 'Account created successfully', { account }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllUserAccounts(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const accounts = await this.accountService.getAccountsByUserId(params.user.id);
      Utility.handleSuccess(res, 'Accounts fetched successfully', { accounts }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getUserAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const account = await this.accountService.getAccountByField({ id: Utility.escapeHtml(id) });
      if (!account) {
        Utility.handleError(res, 'Account not found', ResponseCode.NOT_FOUND);
        return;
      }
      Utility.handleSuccess(res, 'Account fetched successfully', { account }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllUserPayee(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const payees = await this.payeeService.getPayeesByUserId(params.user.id);
      Utility.handleSuccess(res, 'Payees fetched successfully', { payees }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getUserPayee(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payee = await this.payeeService.getPayeeByField({ id: Utility.escapeHtml(id) });
      if (!payee) {
        Utility.handleError(res, 'Payee not found', ResponseCode.NOT_FOUND);
        return;
      }
      Utility.handleSuccess(res, 'Payee fetched successfully', { payee }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async applyLoan(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const account = await this.accountService.getAccountByField({ id: params.accountId });
      if (!account) {
        Utility.handleError(res, 'Account not found', ResponseCode.NOT_FOUND);
        return;
      }
      const loan = await this.loanService.createLoan({
        userId: params.user.id,
        accountId: params.accountId,
        amount: params.amount,
        interest: LoanInterest,
      });
      Utility.handleSuccess(res, 'Loan application submitted successfully', { loan }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getAllUserLoan(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const loans = await this.loanService.getLoansByUserId(params.user.id);
      Utility.handleSuccess(res, 'Loans fetched successfully', { loans }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  // ── Admin methods ──────────────────────────────────────────────────
  async getAllUserAccountsAdmin(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await this.accountService.getAccounts();
      Utility.handleSuccess(res, 'Accounts fetched successfully', { accounts }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getUserAccountAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const account = await this.accountService.getAccountByField({ id: Utility.escapeHtml(id) });
      if (!account) {
        Utility.handleError(res, 'Account not found', ResponseCode.NOT_FOUND);
        return;
      }
      Utility.handleSuccess(res, 'Account fetched successfully', { account }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async getLoansAdmin(req: Request, res: Response): Promise<void> {
    try {
      const loans = await this.loanService.getLoans();
      Utility.handleSuccess(res, 'Loans fetched successfully', { loans }, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }

  async approveOrDeclineLoanByAdmin(req: Request, res: Response): Promise<void> {
    try {
      const params = { ...req.body };
      const loan = await this.loanService.getLoanByField({ id: params.loanId });
      if (!loan) {
        Utility.handleError(res, 'Loan not found', ResponseCode.NOT_FOUND);
        return;
      }
      if (loan.status !== LoanStatus.PENDING) {
        Utility.handleError(res, 'Loan has already been processed', ResponseCode.BAD_REQUEST);
        return;
      }
      await this.loanService.updateRecord({ id: params.loanId }, { status: params.status });

      // If approved, credit the account
      if (params.status === LoanStatus.ACTIVE) {
        await this.accountService.topUpBalance(loan.accountId, loan.amount);
      }

      Utility.handleSuccess(res, `Loan ${params.status.toLowerCase()} successfully`, {}, ResponseCode.SUCCSESS);
    } catch (error) {
      Utility.handleError(res, (error as TypeError).message, ResponseCode.SERVER_ERROR);
    }
  }
}

export default AccountController;