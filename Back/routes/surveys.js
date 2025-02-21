import express from "express";
import { createSurvey, getAllSurveys, getSurveyById, updateSurvey, deleteSurvey, getUserSurveys, getSurveyResponseCount } from "../controllers/surveyController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Créer un sondage (protégé)
router.post("/", auth, createSurvey);

// Récupérer tous les sondages (protégé)
router.get("/", auth, getAllSurveys);

// Récupérer les sondages de l'utilisateur connecté (protégé)
router.get("/user", auth, getUserSurveys);

// Récupérer un sondage spécifique (public)
router.get("/:id", getSurveyById);

// Mettre à jour un sondage (protégé)
router.put("/:id", auth, updateSurvey);

// Supprimer un sondage (protégé)
router.delete("/:id", auth, deleteSurvey);

// Récupérer le nombre de réponses d'un sondage (protégé)
router.get("/:id/responses/count", auth, getSurveyResponseCount);

export default router; 