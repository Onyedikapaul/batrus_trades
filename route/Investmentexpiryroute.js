import express from "express";
import { checkExpiredInvestments } from "../controller/InvestmentexpiryController.js";
import checkAuth from "../middleware/checkAuth.js";

const InvestmentExpiryRouter = express.Router();

// Your external script hits this endpoint
// e.g. GET https://yourdomain.com/api/investments/check-expired
InvestmentExpiryRouter.get("/check-expired", checkAuth, checkExpiredInvestments);

export default InvestmentExpiryRouter;