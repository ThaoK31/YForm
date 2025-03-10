import { ResponseData, ApiResponse, RawResponseData } from '../types/api';
import { API_URL } from '../constants';

async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseData = await response.json();
    
    if (!response.ok) {
        const errorMessage = typeof responseData === 'string' 
            ? responseData 
            : responseData.error || responseData.message || "Une erreur est survenue";
        
        return { 
            error: errorMessage,
            status: response.status 
        };
    }

    return { 
        data: responseData.data || responseData,
        status: response.status
    };
}

export const submitResponse = async (token: string | null, data: { 
    survey_id: string; 
    answers: Array<{ question_id: string; value: string }>;
    anonymous?: boolean;
}): Promise<ApiResponse<RawResponseData>> => {
    if (!data.survey_id || !data.answers || data.answers.length === 0) {
        return {
            error: 'Données de réponse invalides',
            status: 400
        };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Ajouter le token d'authentification seulement s'il est fourni et qu'on n'est pas en mode anonyme
    if (token && !data.anonymous) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/responses`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });

    return handleApiResponse<RawResponseData>(response);
};

export const getResponseById = async (token: string, response_id: string): Promise<ApiResponse<RawResponseData>> => {
    if (!response_id) {
        return {
            error: 'ID de réponse manquant',
            status: 400
        };
    }

    const response = await fetch(`${API_URL}/api/responses/${response_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    return handleApiResponse<RawResponseData>(response);
};

export const getSurveyResponses = async (token: string, survey_id: string): Promise<ApiResponse<RawResponseData[]>> => {
    if (!survey_id) {
        return {
            error: 'ID du sondage manquant',
            status: 400
        };
    }

    const response = await fetch(`${API_URL}/api/responses/survey/${survey_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    return handleApiResponse<RawResponseData[]>(response);
};

export const getUserResponses = async (token: string): Promise<ApiResponse<RawResponseData[]>> => {
    const response = await fetch(`${API_URL}/api/responses/user`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    return handleApiResponse<RawResponseData[]>(response);
};

export const deleteResponse = async (token: string, response_id: string): Promise<ApiResponse<{ message: string }>> => {
    if (!response_id) {
        return {
            error: 'ID de réponse manquant',
            status: 400
        };
    }

    const response = await fetch(`${API_URL}/api/responses/${response_id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    return handleApiResponse<{ message: string }>(response);
};

export const getTotalResponses = async (token: string): Promise<ApiResponse<number>> => {
    const response = await fetch(`${API_URL}/api/responses/total`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    const result = await handleApiResponse<{ total: number }>(response);
    return {
        ...result,
        data: result.data?.total
    };
};
