import express from "express";
import {
  adminLoginAsUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPermission,
} from "../../controller/admin/AdminUserController.js";
import { sendAdminEmailToUser } from "../../controller/admin/SendEmailController.js";

const AdminUserRouter = express.Router();

AdminUserRouter.get("/users", getAllUsers); // GET all users
AdminUserRouter.get('/users/:id', getUserById);
AdminUserRouter.post("/users/:id/login", adminLoginAsUser); // POST login as user
AdminUserRouter.patch("/users/:id/permission", updateUserPermission); // PATCH deposit/withdraw permission
AdminUserRouter.patch('/users/:id', updateUser);
AdminUserRouter.delete('/users/:id', deleteUser);

// Send Email Route
AdminUserRouter.post('/messages/email/:id', sendAdminEmailToUser);

export default AdminUserRouter;
