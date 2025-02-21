// Types liés aux réponses
export interface Answer {
    question_id: string;
    answer: string;
}

export interface Response {
    response_id: string;
    survey_id: string;
    user_id: string;
    answers: Answer[];
    created_at: string;    // Date de création au format ISO
    __v: number;          // Version MongoDB
}

// Version enrichie avec les données du sondage et de l'utilisateur
export interface ResponseWithDetails extends Omit<Response, 'survey_id' | 'user_id'> {
    survey: {
        survey_id: string;
        name: string;
        questions: {
            question_id: string;
            text: string;
            type: string;
            options: string[];
        }[];
    };
    user: {
        user_id: string;
        name: string;
        email: string;
    };
}

// Types pour la création
export interface CreateResponseData {
    survey_id: string;
    answers: Answer[];
}
