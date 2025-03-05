import express from "express";
import { submitResponse, getResponseById, getSurveyResponses, getUserResponses, deleteResponse, getTotalResponses } from "../controllers/responseController.js";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

// Obtenir le total des réponses pour tous les sondages de l'utilisateur
router.get("/total", auth, getTotalResponses);

// Soumettre une réponse (protégé, mais permet l'anonyme via l'authentification optionnelle)
router.post("/", optionalAuth, submitResponse);

// Récupérer toutes les réponses d'un sondage (protégé, uniquement pour le créateur du sondage)
router.get("/survey/:survey_id", auth, getSurveyResponses);

// Récupérer toutes les réponses de l'utilisateur courant (protégé)
router.get("/user", auth, getUserResponses);

// Récupérer une réponse spécifique (protégé)
router.get("/:response_id", auth, getResponseById);

// Supprimer une réponse (protégé, uniquement pour le créateur de la réponse)
router.delete("/:response_id", auth, deleteResponse);

export default router; 