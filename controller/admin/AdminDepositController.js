import e from "express";
import Depositmodel from "../../model/Depositmodel.js";

const AdminDepositController = e.Router();

// GET /api/admin/deposits — all deposits across all users
AdminDepositController.get("/deposits", async (req, res) => {
  try {
    const deposits = await Depositmodel.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error("getAllDeposits error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

export default AdminDepositController;