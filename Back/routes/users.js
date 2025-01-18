import express from "express";
import { signup, login } from "../controllers/userController.js";

const router = express.Router();

// Inscription d'un utilisateur
router.post("/signup", signup);

// Connexion d'un utilisateur
router.post("/login", login);

export default router; 