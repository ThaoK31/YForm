import Response from "../models/Response.js";
import Survey from "../models/Survey.js";
import { ApiError } from '../middleware/errorHandler.js';

export const createResponse = async ({ survey_id, user_id, answers }) => {
    // Vérifier que le sondage existe et récupérer ses informations
    const survey = await Survey.findById(survey_id).populate('creator');
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }

    // Valider les réponses
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new ApiError(400, 'Le sondage doit contenir au moins une réponse');
    }

    // Valider que chaque réponse correspond à une question et est valide
    for (const answer of answers) {
        if (!answer.question_id || !answer.value) {
            throw new ApiError(400, 'Chaque réponse doit avoir un question_id et une value');
        }

        // Trouver la question correspondante
        const question = survey.questions.find(q => q._id.toString() === answer.question_id);
        if (!question) {
            throw new ApiError(404, 'Question non trouvée');
        }

        // Valider les réponses MCQ
        if (question.type === 'mcq' && !question.options.includes(answer.value)) {
            throw new ApiError(400, 'Réponse invalide pour une question à choix multiples');
        }
    }

    // Vérifier si l'utilisateur a déjà répondu
    const existingResponse = await Response.findOne({ survey_id, user_id });
    if (existingResponse) {
        // Mettre à jour la réponse existante
        existingResponse.answers = answers;
        await existingResponse.save();
        
        return Response.findById(existingResponse._id)
            .populate({
                path: 'survey_id',
                populate: { 
                    path: 'creator',
                    select: 'name email'
                }
            })
            .populate('user_id', 'name email');
    }

    // Créer une nouvelle réponse
    const response = await Response.create({
        survey_id,
        user_id,
        answers
    });

    // Retourner la réponse avec les références peuplées
    return Response.findById(response._id)
        .populate({
            path: 'survey_id',
            populate: { 
                path: 'creator',
                select: 'name email'
            }
        })
        .populate('user_id', 'name email');
};

export const findResponseById = async (response_id, user_id) => {
    const response = await Response.findById(response_id)
        .populate({
            path: 'survey_id',
            populate: { 
                path: 'creator',
                select: 'name email'
            }
        })
        .populate('user_id', 'name email');

    if (!response) {
        throw new ApiError(404, 'Réponse non trouvée');
    }

    // Vérifier si l'utilisateur est autorisé (créateur du sondage ou propriétaire de la réponse)
    const isCreator = response.survey_id.creator._id.toString() === user_id.toString();
    const isOwner = response.user_id._id.toString() === user_id.toString();

    if (!isCreator && !isOwner) {
        throw new ApiError(403, 'Non autorisé');
    }

    return response;
};

export const findSurveyResponses = async (survey_id, user_id) => {
    // Vérifier que le sondage existe
    const survey = await Survey.findById(survey_id).populate('creator');
    if (!survey) {
        throw new ApiError(404, 'Sondage non trouvé');
    }

    // Vérifier si l'utilisateur est le créateur du sondage
    const isCreator = survey.creator._id.toString() === user_id.toString();

    // Si c'est le créateur, retourner toutes les réponses
    if (isCreator) {
        return Response.find({ survey_id })
            .populate('user_id', 'name email')
            .populate({
                path: 'survey_id',
                populate: { 
                    path: 'creator',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });
    }

    // Si ce n'est pas le créateur, vérifier s'il a répondu et retourner uniquement sa réponse
    const userResponse = await Response.findOne({ 
        survey_id, 
        user_id 
    })
    .populate('user_id', 'name email')
    .populate({
        path: 'survey_id',
        populate: { 
            path: 'creator',
            select: 'name email'
        }
    });

    if (!userResponse) {
        throw new ApiError(403, 'Non autorisé');
    }

    // Retourner la réponse dans un tableau pour maintenir la cohérence du format
    return [userResponse];
};

export const findUserResponses = async (user_id) => {
    return Response.find({ user_id })
        .populate({
            path: 'survey_id',
            populate: { 
                path: 'creator',
                select: 'name email'
            }
        })
        .populate('user_id', 'name email')
        .sort({ createdAt: -1 });
};

export const deleteResponseById = async (response_id, user_id) => {
    const response = await Response.findById(response_id)
        .populate({
            path: 'survey_id',
            populate: { 
                path: 'creator',
                select: 'name email'
            }
        });

    if (!response) {
        throw new ApiError(404, 'Réponse non trouvée');
    }

    // Vérifier que l'utilisateur est le créateur de la réponse
    if (response.user_id.toString() !== user_id.toString()) {
        throw new ApiError(403, 'Non autorisé à supprimer cette réponse');
    }

    await Response.findByIdAndDelete(response_id);
}; 