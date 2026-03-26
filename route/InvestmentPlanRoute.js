import e from "express";
import checkAuth from "../middleware/checkAuth.js";
import { fetchInvestmentPlan } from "../controller/InvestmentPlanController.js";

const InvestmentPlanRouter = e.Router();

InvestmentPlanRouter.get("/plans", checkAuth, fetchInvestmentPlan);

export default InvestmentPlanRouter;
