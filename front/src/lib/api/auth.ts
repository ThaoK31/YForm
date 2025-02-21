import { AuthResponse, ApiResponse } from '../types/api';
import { API_URL } from '../constants';

// Configuration par défaut pour fetch
const defaultOptions = {
    credentials: 'include' as const,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

export const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Erreur réseau');
    }

    return response.json();
};

export const register = async (name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
        throw new Error('Erreur réseau');
    }

    return response.json();
};

export const getCurrentUser = async (token: string): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
        ...defaultOptions,
        headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Erreur réseau');
    }

    return response.json();
};
