import Survey from "../models/Survey.js";

export const createSurvey = async (name, questions, creatorId) => {
    const survey = new Survey({
        name,
        questions,
        creator: creatorId
    });
    
    await survey.save();
    return survey;
};

export const getAllSurveys = async () => {
    return await Survey.find().populate('creator', 'name email');
};

export const getSurveyById = async (surveyId) => {
    const survey = await Survey.findById(surveyId).populate('creator', 'name email');
    if (!survey) {
        throw new Error('Sondage non trouvé');
    }
    return survey;
};

export const deleteSurvey = async (surveyId, userId) => {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
        throw new Error('Sondage non trouvé');
    }
    
    if (survey.creator.toString() !== userId) {
        throw new Error('Non autorisé');
    }

    await survey.deleteOne();
    return { message: "Sondage supprimé avec succès" };
}; 