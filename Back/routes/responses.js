import express from "express";
import { submitResponse, getResponseById, getSurveyResponses, getUserResponses } from "../controllers/responseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Soumettre une réponse (protégé)
router.post("/", auth, submitResponse);

// Récupérer toutes les réponses d'un sondage (protégé, uniquement pour le créateur du sondage)
router.get("/survey/:survey_id", auth, getSurveyResponses);

// Récupérer toutes les réponses de l'utilisateur courant (protégé)
router.get("/user", auth, getUserResponses);

// Récupérer une réponse spécifique (protégé)
router.get("/:response_id", auth, getResponseById);

export default router; 