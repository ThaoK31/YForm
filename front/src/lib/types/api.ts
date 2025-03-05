// Types génériques pour les réponses API
export interface ApiResponse<T> {
    data?: T;        // Données de la réponse en cas de succès
    error?: string;  // Message d'erreur en cas d'échec
    status: number;  // Code de statut HTTP
}

// Types d'erreurs
export interface ApiError {
    error: string;      // Message d'erreur principal
    details?: string[]; // Détails supplémentaires de l'erreur
    field?: string;     // Champ concerné par l'erreur
}

export interface ValidationError extends ApiError {
    details: string[];  // Liste des erreurs de validation
}

export interface DuplicateError extends ApiError {
    field: string;      // Champ qui cause la duplication
}

export interface AuthError extends ApiError {
    error: 'Token invalide' | 'Token expiré';
}

// Types liés à l'authentification
export interface UserResponse {
    _id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: UserResponse;
    token: string;     // JWT token pour l'authentification
}

// Types liés aux questions
export interface Question {
    _id: string;
    text: string;
    type: "open" | "mcq" | "yes/no";
    options: string[];  // Options pour les questions MCQ
    order?: number;     // Ordre de la question
}

// Types liés aux sondages
export interface RawSurveyResponse {
    _id: string;
    name: string;
    creator: string;    // ID de l'utilisateur créateur
    questions: Question[];
    created_at: string;    // Date de création au format ISO
    __v: number;          // Version MongoDB
}

export interface SurveyResponse extends Omit<RawSurveyResponse, 'creator'> {
    creator: UserResponse; // Informations complètes du créateur
}

// Types liés aux réponses aux sondages
export interface SurveyAnswer {
    question_id: string;
    value: string;
}

export interface RawResponseData {
    _id: string;
    survey_id: SurveyResponse;
    user_id?: UserResponse;
    anonymous?: boolean;
    answers: SurveyAnswer[];
    created_at: string;
}

export interface ResponseData {
    _id: string;
    survey_id: string;
    user_id?: string;
    anonymous?: boolean;
    answers: SurveyAnswer[];
    created_at: string;
}

// Types enrichis avec les données complètes
export interface EnrichedSurveyAnswer extends Omit<SurveyAnswer, 'question_id'> {
    question: Question;
}

export interface EnrichedResponseData {
    _id: string;
    survey: SurveyResponse;
    user: UserResponse | null;
    anonymous?: boolean;
    answers: EnrichedSurveyAnswer[];
    created_at: string;
} 