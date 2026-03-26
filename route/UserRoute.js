import express from "express";
import { register, login, logout, verifyEmail, resendVerificationCode, forgotPassword, resetPassword } from "../controller/UserController.js";
import checkAuth from "../middleware/checkAuth.js";

const UserRouter = express.Router();

UserRouter.post("/register", register);
UserRouter.post("/login", login);
UserRouter.post("/logout", logout);
UserRouter.post("/verify-email", verifyEmail);
UserRouter.post("/resend-verification", resendVerificationCode);


UserRouter.post("/forgot-password", forgotPassword);
UserRouter.post("/reset-password", resetPassword);


UserRouter.get("/check-auth", checkAuth, (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Authenticated",
    userId: req.user._id,
  });
});


export default UserRouter;