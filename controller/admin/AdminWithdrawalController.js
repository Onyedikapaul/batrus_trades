import e from "express";
import Withdrawalmodel from "../../model/Withdrawalmodel.js";

const AdminWithdrawalController = e.Router();

// GET /api/admin/withdrawals — all withdrawals across all users
AdminWithdrawalController.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await Withdrawalmodel.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error("getAllWithdrawals error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

export default AdminWithdrawalController;