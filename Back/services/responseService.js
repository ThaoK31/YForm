import Response from "../models/Response.js";
import Survey from "../models/Survey.js";

export const createResponse = async (surveyId, userId, answers) => {
    // Vérifier si le sondage existe
    const survey = await Survey.findById(surveyId);
    if (!survey) {
        throw new Error('Sondage non trouvé');
    }

    // Vérifier si l'utilisateur a déjà répondu
    const existingResponse = await Response.findOne({ survey_id: surveyId, user_id: userId });
    if (existingResponse) {
        throw new Error('Vous avez déjà répondu à ce sondage');
    }

    const response = new Response({
        survey_id: surveyId,
        user_id: userId,
        answers: answers.map(answer => ({
            question_id: answer.questionId,
            answer: answer.value
        }))
    });

    await response.save();
    return response;
}; 