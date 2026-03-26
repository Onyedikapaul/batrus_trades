import express from "express";
import { submitContactForm } from "../controller/Contactcontroller.js";

const ContactRouter = express.Router();

ContactRouter.post("/", submitContactForm);

export default ContactRouter;
