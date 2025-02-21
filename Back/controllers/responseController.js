import { createResponse, findResponseById, findSurveyResponses, findUserResponses } from '../services/responseService.js';

export const submitResponse = async (req, res) => {
    try {
        const { survey_id, answers } = req.body;
        
        if (!survey_id || !answers) {
            return res.status(400).json({ error: 'Le sondage et les réponses sont requis' });
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
        console.error('❌ Erreur lors de la soumission de la réponse :', error);
        if (error.message.includes('Réponse invalide pour une question à choix multiples')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Sondage non trouvé') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Réponse déjà soumise') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getResponseById = async (req, res) => {
    try {
        const response = await findResponseById(req.params.response_id, req.user._id);
        res.json(response);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la réponse :', error);
        if (error.message === 'Non autorisé') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Réponse non trouvée' || error.name === 'CastError') {
            return res.status(404).json({ error: 'Réponse non trouvée' });
        }
        res.status(500).json({ error: 'Erreur lors de la récupération de la réponse' });
    }
};

export const getSurveyResponses = async (req, res) => {
    try {
        const responses = await findSurveyResponses(req.params.survey_id, req.user._id);
        res.json(responses);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des réponses du sondage :', error);
        if (error.message === 'Non autorisé') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Sondage non trouvé' || error.name === 'CastError') {
            return res.status(404).json({ error: 'Sondage non trouvé' });
        }
        res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
    }
};

export const getUserResponses = async (req, res) => {
    try {
        const responses = await findUserResponses(req.user._id);
        res.json(responses);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des réponses :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
    }
}; 