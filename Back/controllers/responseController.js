import { createResponse, findResponseById, findSurveyResponses, findUserResponses } from '../services/responseService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const submitResponse = async (req, res, next) => {
    try {
        const { survey_id, answers } = req.body;
        
        if (!survey_id || !answers) {
            throw new ApiError(400, 'Le sondage et les réponses sont requis');
        }

        const response = await createResponse({
            survey_id,
            user_id: req.user._id,
            answers: answers.map(answer => ({
                question_id: answer.question_id,
                value: answer.value
            }))
        });

        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getResponseById = async (req, res, next) => {
    try {
        const response = await findResponseById(req.params.response_id, req.user._id);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getSurveyResponses = async (req, res, next) => {
    try {
        const responses = await findSurveyResponses(req.params.survey_id, req.user._id);
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