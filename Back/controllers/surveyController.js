import * as surveyService from '../services/surveyService.js';
import { ApiError } from '../middleware/errorHandler.js';

const validateQuestions = (questions) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, 'Le sondage doit contenir au moins une question.');
    }

    for (const question of questions) {
        if (!question.text || question.text.trim().length < 3) {
            throw new ApiError(400, 'Chaque question doit contenir au moins 3 caractères.');
        }
        if (question.type === "mcq" && (!question.options || question.options.length < 2)) {
            throw new ApiError(400, 'Les questions MCQ doivent avoir au moins 2 options');
        }
    }
};

export const createSurvey = async (req, res, next) => {
    const { name, questions } = req.body;
    const creator_id = req.user._id;

    if (!name) {
        return next(new ApiError(400, 'Le champ "nom" est obligatoire.'));
    }

    try {
        validateQuestions(questions);
        const survey = await surveyService.createSurvey(name, questions, creator_id);
        res.status(201).json(survey);
    } catch (error) {
        next(error);
    }
};

export const getAllSurveys = async (req, res, next) => {
    try {
        const surveys = await surveyService.getAllSurveys(req.user._id);
        res.json(surveys);
    } catch (error) {
        next(error);
    }
};

export const getSurveyById = async (req, res, next) => {
    try {
        const survey = await surveyService.getSurveyById(req.params.id);
        res.json(survey);
    } catch (error) {
        next(error);
    }
};

export const deleteSurvey = async (req, res, next) => {
    try {
        const result = await surveyService.deleteSurvey(req.params.id, req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateSurvey = async (req, res, next) => {
    try {
        if (req.body.questions) {
            validateQuestions(req.body.questions);
        }

        const survey = await surveyService.updateSurvey(
            req.params.id,
            req.user._id,
            {
                name: req.body.name,
                questions: req.body.questions
            }
        );
        res.json(survey);
    } catch (error) {
        next(error);
    }
};

export const getUserSurveys = async (req, res, next) => {
    try {
        const surveys = await surveyService.getUserSurveys(req.user._id);
        res.json(surveys);
    } catch (error) {
        next(error);
    }
};

export const getSurveyResponseCount = async (req, res, next) => {
    try {
        const count = await surveyService.getSurveyResponseCount(req.params.id, req.user._id);
        res.json({ count });
    } catch (error) {
        next(error);
    }
}; 