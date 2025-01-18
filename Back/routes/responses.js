import express from "express";
import { submitResponse } from "../controllers/responseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Submit a response (protected)
router.post("/", auth, submitResponse);

export default router; 