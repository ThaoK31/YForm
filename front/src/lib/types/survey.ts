// Types de questions possibles
export type QuestionType = "open" | "mcq" | "yes/no";

// Types liés aux questions
export interface Question {
    question_id: string;
    text: string;
    type: QuestionType;
    options: string[];  // Options pour les questions MCQ
    order?: number;     // Ordre de la question dans le sondage
}

// Types liés aux sondages
export interface Survey {
    survey_id: string;
    name: string;
    creator_id: string;    // ID de l'utilisateur créateur
    questions: Question[];
    created_at: string;    // Date de création au format ISO
    __v: number;          // Version MongoDB
}

// Version enrichie avec les données utilisateur
export interface SurveyWithCreator extends Omit<Survey, 'creator_id'> {
    creator: {
        user_id: string;
        name: string;
        email: string;
    };
}

// Types pour la création/mise à jour
export interface CreateSurveyData {
    name: string;
    questions: Omit<Question, 'question_id'>[];
}

export interface UpdateSurveyData {
    name?: string;
    questions?: Omit<Question, 'question_id'>[];
}
