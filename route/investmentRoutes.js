import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import {
  createInvestment,
  fetchSinglePlan,
  fetchUserInvestments,
  getInvestmentStats,
} from "../controller/investmentController.js";
import { requireKYC } from "../controller/KYCController.js";

const InvestmentRouter = express.Router();

InvestmentRouter.get("/plans/:id", fetchSinglePlan);
InvestmentRouter.post("/invest", checkAuth, requireKYC, createInvestment);
InvestmentRouter.get("/user", checkAuth, fetchUserInvestments);
InvestmentRouter.get("/stats", checkAuth, getInvestmentStats);

export default InvestmentRouter;
