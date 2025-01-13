import * as surveyService from '../services/surveyService.js';

export const createSurvey = async (req, res) => {
    const { name, questions } = req.body;
    const creatorId = req.user.id;

    if (!name) return res.status(400).json({ error: 'Le champ "nom" est obligatoire.' });
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Le sondage doit contenir au moins une question.' });
    }

    try {
        const survey = await surveyService.createSurvey(name, questions, creatorId);
        res.status(201).json(survey);
    } catch (error) {
        console.error('❌ Erreur lors de la création du sondage :', error);
        res.status(400).json({ error: error.message });
    }
};

export const getAllSurveys = async (req, res) => {
    try {
        const surveys = await surveyService.getAllSurveys();
        res.status(200).json(surveys);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des sondages :', error);
        res.status(500).json({ error: error.message });
    }
};

export const getSurveyById = async (req, res) => {
    try {
        const survey = await surveyService.getSurveyById(req.params.id);
        res.json(survey);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du sondage :', error);
        res.status(404).json({ error: error.message });
    }
};

export const deleteSurvey = async (req, res) => {
    try {
        const result = await surveyService.deleteSurvey(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        console.error('❌ Erreur lors de la suppression du sondage :', error);
        if (error.message === 'Non autorisé') {
            return res.status(403).json({ error: error.message });
        }
        res.status(404).json({ error: error.message });
    }
}; 