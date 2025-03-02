import { AuthResponse, ApiResponse } from '../types/api';
import { API_URL } from '../constants';
import { User } from '@/lib/types/user';

// Configuration par défaut pour fetch
const defaultOptions = {
    credentials: 'include' as const,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData extends LoginData {
    name: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

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
        data: responseData.user,
        status: response.status 
    };
}

export const login = async (data: LoginData): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });

    return handleApiResponse<{ token: string; user: User }>(response);
};

export const register = async (data: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });

    return handleApiResponse<{ token: string; user: User }>(response);
};

export const getCurrentUser = async (token: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
        ...defaultOptions,
        headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${token}`,
        },
    });

    return handleApiResponse<User>(response);
};

export const updateUser = async (token: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    return handleApiResponse<User>(response);
};
