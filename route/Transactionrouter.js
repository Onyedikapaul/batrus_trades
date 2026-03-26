import e from "express";

import checkAuth from "../middleware/checkAuth.js";
import {
  cancelDeposit,
  confirmDeposit,
  createDeposit,
  getAllDeposits,
  getMyDeposits,
  rejectDeposit,
} from "../controller/Depositcontroller.js";
import {
  approveWithdrawal,
  cancelWithdrawal,
  createWithdrawal,
  getAllWithdrawals,
  getMyWithdrawals,
  rejectWithdrawal,
} from "../controller/Withdrawalcontroller.js";
import { downloadDepositReceipt } from "../controller/Depositreceiptcontroller.js";
import { downloadWithdrawalReceipt } from "../controller/Withdrawalreceiptcontroller.js";
import { requireKYC } from "../controller/KYCController.js";
// import checkAdmin from "../middleware/checkAdmin.js"; // make sure you have this

const TransactionRouter = e.Router();

// ─── Deposit routes ───────────────────────────────────────────────────────────
TransactionRouter.post("/deposit", checkAuth, createDeposit);
TransactionRouter.get("/deposit/my-history", checkAuth, getMyDeposits);
TransactionRouter.patch("/deposit/:id/cancel", checkAuth, cancelDeposit);
TransactionRouter.get("/deposit/all", checkAuth, getAllDeposits);
TransactionRouter.patch("/deposit/:id/confirm", checkAuth, confirmDeposit);
TransactionRouter.patch("/deposit/:id/reject", checkAuth, rejectDeposit);
TransactionRouter.get(
  "/deposit/:id/receipt",
  checkAuth,
  downloadDepositReceipt,
);

// ─── Withdrawal routes ────────────────────────────────────────────────────────
TransactionRouter.post("/withdrawal", checkAuth, requireKYC, createWithdrawal);
TransactionRouter.get(
  "/withdrawal/:id/receipt",
  checkAuth,
  downloadWithdrawalReceipt,
);
TransactionRouter.get("/withdrawal/my-history", checkAuth, getMyWithdrawals);
TransactionRouter.patch("/withdrawal/:id/cancel", checkAuth, cancelWithdrawal);
TransactionRouter.get("/withdrawal/all", checkAuth, getAllWithdrawals);
TransactionRouter.patch(
  "/withdrawal/:id/approve",
  checkAuth,
  approveWithdrawal,
);
TransactionRouter.patch("/withdrawal/:id/reject", checkAuth, rejectWithdrawal);

export default TransactionRouter;
