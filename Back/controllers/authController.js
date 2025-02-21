import * as authService from '../services/authService.js';
import { ApiError } from '../middleware/errorHandler.js';

export const register = async (req, res, next) => {
    const { name, email, password } = req.body;

    // Validation des champs
    if (!name) return next(new ApiError(400, 'Le nom est requis'));
    if (!email) return next(new ApiError(400, 'L\'email est requis'));
    if (!password) return next(new ApiError(400, 'Le mot de passe est requis'));

    if (password.length < 6) {
        return next(new ApiError(400, 'Le mot de passe doit contenir au moins 6 caractères'));
    }

    try {
        const result = await authService.registerUser(name, email, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    // Validation des champs
    if (!email) return next(new ApiError(400, 'L\'email est requis'));
    if (!password)  return next(new ApiError(400, 'Le mot de passe est requis'));
    

    try {
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const result = await authService.getCurrentUser(req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
}; 