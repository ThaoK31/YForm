import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ApiError } from './types/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleApiError = (error: unknown): ApiError => {
    if (error instanceof Response) {
        return {
            error: `Erreur HTTP: ${error.status}`,
        };
    }

    if (error instanceof Error) {
        return {
            error: error.message,
        };
    }

    return {
        error: 'Une erreur inconnue est survenue',
    };
};

export const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'error' in error
    );
};
