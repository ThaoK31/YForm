import { createResponse, findResponseById, findSurveyResponses, findUserResponses, deleteResponseById, getTotalResponsesForUser } from '../services/responseService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const submitResponse = async (req, res, next) => {
    try {
        const { survey_id, answers, anonymous } = req.body;
        
        if (!survey_id || !answers) {
            throw new ApiError(400, 'Le sondage et les réponses sont requis');
        }

        // Gérer le cas anonyme ou authentifié
        const responseData = {
            survey_id,
            answers: answers.map(answer => ({
                question_id: answer.question_id,
                value: answer.value
            }))
        };

        // Si anonyme est true, on ne met pas de user_id
        if (anonymous) {
            responseData.anonymous = true;
            // S'assurer que user_id n'est pas présent
            delete responseData.user_id;
        } else if (req.user) {
            // Sinon, on utilise l'utilisateur connecté si disponible
            responseData.user_id = req.user._id;
            responseData.anonymous = false;
        } else {
            // Si ni anonyme ni authentifié, erreur
            throw new ApiError(401, 'Vous devez être connecté ou choisir le mode anonyme');
        }

        const response = await createResponse(responseData);

        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getResponseById = async (req, res, next) => {
    try {
        const response = await findResponseById(req.params.response_id, req.user?._id);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getSurveyResponses = async (req, res, next) => {
    try {
        const responses = await findSurveyResponses(req.params.survey_id, req.user?._id);
        res.json(responses);
    } catch (error) {
        next(error);
    }
};

export const getUserResponses = async (req, res, next) => {
    try {
        const responses = await findUserResponses(req.user._id);
        res.json(responses);
    } catch (error) {
        next(error);
    }
};

export const deleteResponse = async (req, res, next) => {
    try {
        await deleteResponseById(req.params.response_id, req.user._id);
        res.status(200).json({ message: 'Réponse supprimée avec succès' });
    } catch (error) {
        next(error);
    }
};

export const getTotalResponses = async (req, res, next) => {
    try {
        const total = await getTotalResponsesForUser(req.user._id);
        res.json({ total });
    } catch (error) {
        next(error);
    }
}; 