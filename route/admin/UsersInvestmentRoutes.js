import e from "express";
import { adminCancelInvestment, adminCompleteInvestment, adminGetAllInvestments } from "../../controller/admin/UsersInvestmentController.js";
import Investmentmodel from "../../model/Investmentmodel.js";

const UsersInvestmentRouter = e.Router();


UsersInvestmentRouter.get('/admin/all', adminGetAllInvestments);
UsersInvestmentRouter.patch('/admin/:id/complete', adminCompleteInvestment);
UsersInvestmentRouter.patch('/admin/:id/cancel', adminCancelInvestment);

UsersInvestmentRouter.delete("/admin/:id", async (req, res) => {
  const inv = await Investmentmodel.findByIdAndDelete(req.params.id);
  if (!inv) return res.status(404).json({ success: false, message: "Investment not found" });
  return res.json({ success: true, message: "Investment deleted" });
});

export default UsersInvestmentRouter;