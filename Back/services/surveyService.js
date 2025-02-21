import Survey from "../models/Survey.js";
import Response from "../models/Response.js";
import { ApiError } from '../middleware/errorHandler.js';

export const createSurvey = async (name, questions, creator_id) => {
    const survey = new Survey({
        name,
        questions,
        creator: creator_id
    });
    
    await survey.save();
    return await Survey.findById(survey._id).populate('creator', 'name email');
};

export const getAllSurveys = async (user_id) => {
    return await Survey.find({
        $or: [
            { creator: user_id },
            // Ajouter ici une condition pour les sondages publics si nécessaire
        ]
    }).populate('creator', 'name email');
};

export const getSurveyById = async (survey_id) => {
    const survey = await Survey.findById(survey_id).populate('creator', 'name email');
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }
    return survey;
};

export const deleteSurvey = async (survey_id, user_id) => {
    const survey = await Survey.findById(survey_id).populate('creator');
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }
    
    if (survey.creator._id.toString() !== user_id.toString()) {
        throw new ApiError(403, 'Non autorisé');
    }

    await survey.deleteOne();
    return { message: "Sondage supprimé avec succès" };
};

export const updateSurvey = async (survey_id, user_id, updateData) => {
    const survey = await Survey.findById(survey_id).populate('creator');
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }
    
    if (survey.creator._id.toString() !== user_id.toString()) {
        throw new ApiError(403, 'Non autorisé');
    }

    Object.assign(survey, updateData);
    await survey.save();
    
    return await Survey.findById(survey_id).populate('creator', 'name email');
};

export const getUserSurveys = async (user_id) => {
    return await Survey.find({ creator: user_id }).populate('creator', 'name email');
};

export const getSurveyResponseCount = async (survey_id, user_id) => {
    const survey = await Survey.findById(survey_id);
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }
    
    // Vérifier que l'utilisateur est le créateur du sondage
    if (survey.creator.toString() !== user_id.toString()) {
        throw new ApiError(403, 'Non autorisé');
    }

    const count = await Response.countDocuments({ survey_id });
    return count;
}; 