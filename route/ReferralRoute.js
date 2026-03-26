import e from "express";
import { getMyReferrals, getReferralStats } from "../controller/ReferralController.js";
import checkAuth from "../middleware/checkAuth.js";


const ReferralRouter = e.Router();

ReferralRouter.get("/my-referrals", checkAuth, getMyReferrals);

ReferralRouter.get("/stats", checkAuth, getReferralStats);

export default ReferralRouter;