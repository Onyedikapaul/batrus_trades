import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import UserRouter from "./route/UserRoute.js";
import GetUserDataRouter from "./route/getUserDataRoute.js";
import ReferralRouter from "./route/ReferralRoute.js";
import TransactionRouter from "./route/Transactionrouter.js";
import InvestmentPlanRouter from "./route/InvestmentPlanRoute.js";
import InvestmentRouter from "./route/investmentRoutes.js";
import AdminAuthRouter from "./route/admin/AdminRoute.js";
import AdminInvestmentRouter from "./route/admin/InvestmentRouter.js";
import AdminUserRouter from "./route/admin/AdminUserRoute.js";
import AdminDepositWithdrawalRouter from "./route/admin/adminDepositWithdrawalRoute.js";
import UsersInvestmentRouter from "./route/admin/UsersInvestmentRoutes.js";
import ContactRouter from "./route/ContactRoute.js";
import WalletRouter from "./route/admin/walletRoute.js";
import AdminDepositController from "./controller/admin/AdminDepositController.js";
import AdminWithdrawalController from "./controller/admin/AdminWithdrawalController.js";
import InvestmentExpiryRouter from "./route/Investmentexpiryroute.js";
import KYCRouter from "./controller/KYCController.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = new Set([
  "http://localhost:4000",
  "http://127.0.0.1:5500",
  "https://batrus-trades.pro",
  "https://www.batrus-trades.pro"
]);

// Middleware — order matters, all before routes
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return allowedOrigins.has(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML files from root directory
app.use(express.static(__dirname));

// Test route
app.get("/api", (req, res) => {
  res.send("API Is Working");
});

// User routes
app.use("/api/auth", UserRouter);
app.use("/api/user", GetUserDataRouter);
app.use("/api/referral", ReferralRouter);
app.use("/api/transaction", TransactionRouter);
app.use("/api/investment", InvestmentPlanRouter);
app.use("/api/investment", InvestmentRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/investments", InvestmentExpiryRouter);
app.use("/api/kyc", KYCRouter)


// Admin routes
app.use("/api/admin/auth", AdminAuthRouter);
app.use("/api/admin/investment", AdminInvestmentRouter);
app.use("/api/admin", AdminUserRouter);
app.use("/api/admin", AdminDepositWithdrawalRouter);
app.use("/api/investment", UsersInvestmentRouter);

app.use("/api/wallets", WalletRouter);
app.use("/api/admin/wallets", WalletRouter);

app.use("/api/admin", AdminDepositController);
app.use("/api/admin", AdminWithdrawalController);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
