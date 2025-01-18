import * as responseService from '../services/responseService.js';

export const submitResponse = async (req, res) => {
    const { surveyId, answers } = req.body;
    const userId = req.user.id;

    if (!surveyId) return res.status(400).json({ error: 'Le champ "surveyId" est obligatoire.' });
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Le sondage doit contenir au moins une réponse.' });
    }

    try {
        const response = await responseService.createResponse(surveyId, userId, answers);
        res.status(201).json(response);
    } catch (error) {
        console.error('❌ Erreur lors de la soumission de la réponse :', error);
        res.status(400).json({ error: error.message });
    }
}; 