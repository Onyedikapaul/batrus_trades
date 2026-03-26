import e from "express";
import { getUserData, updateProfile } from "../controller/getUserDataController.js";
import checkAuth from "../middleware/checkAuth.js";

const GetUserDataRouter = e.Router();

GetUserDataRouter.get("/my-data", checkAuth, getUserData);
GetUserDataRouter.put("/update-profile", checkAuth, updateProfile);

export default GetUserDataRouter;