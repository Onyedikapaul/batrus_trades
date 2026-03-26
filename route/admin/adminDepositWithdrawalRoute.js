import e from "express";
import {
  adminAddDeposit,
  adminAddWithdrawal,
  approveWithdrawal,
  confirmDeposit,
  getUserDeposits,
  getUserWithdrawals,
  rejectDeposit,
  rejectWithdrawal,
  setPendingDeposit,
  setPendingWithdrawal,
} from "../../controller/admin/adminDepositWithdrawalController.js";
import Depositmodel from "../../model/Depositmodel.js";
import Withdrawalmodel from "../../model/Withdrawalmodel.js";

const AdminDepositWithdrawalRouter = e.Router();

AdminDepositWithdrawalRouter.post("/users/:id/deposit", adminAddDeposit);
AdminDepositWithdrawalRouter.post("/users/:id/withdrawal", adminAddWithdrawal);

AdminDepositWithdrawalRouter.get("/users/:id/deposits", getUserDeposits);
AdminDepositWithdrawalRouter.get("/users/:id/withdrawals", getUserWithdrawals);

AdminDepositWithdrawalRouter.patch("/withdrawals/:id/pending", setPendingWithdrawal);
AdminDepositWithdrawalRouter.patch("/deposits/:id/pending", setPendingDeposit);

// Deposit routes
AdminDepositWithdrawalRouter.patch("/users/:id/confirm", confirmDeposit);
AdminDepositWithdrawalRouter.patch("/users/:id/reject", rejectDeposit);

// Withdrawal routes
AdminDepositWithdrawalRouter.patch("/users/:id/approve", approveWithdrawal);
AdminDepositWithdrawalRouter.patch("/users/withdrawal/:id/reject", rejectWithdrawal);

AdminDepositWithdrawalRouter.delete("/deposits/:id", async (req, res) => {
  const dep = await Depositmodel.findByIdAndDelete(req.params.id);
  if (!dep) return res.status(404).json({ success: false, message: "Deposit not found" });
  return res.json({ success: true, message: "Deposit deleted" });
});

AdminDepositWithdrawalRouter.delete("/withdrawals/:id", async (req, res) => {
  const dep = await Withdrawalmodel.findByIdAndDelete(req.params.id);
  if (!dep) return res.status(404).json({ success: false, message: "Withdrawal not found" });
  return res.json({ success: true, message: "Withdrawal deleted" });
});

export default AdminDepositWithdrawalRouter;
