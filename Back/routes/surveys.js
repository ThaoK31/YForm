import express from "express";
import { createSurvey, getAllSurveys, getSurveyById, deleteSurvey } from "../controllers/surveyController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Créer un sondage (protégé)
router.post("/", auth, createSurvey);

// Récupérer tous les sondages
router.get("/", getAllSurveys);

// Récupérer un sondage spécifique
router.get("/:id", getSurveyById);

// Supprimer un sondage (protégé)
router.delete("/:id", auth, deleteSurvey);

export default router; 