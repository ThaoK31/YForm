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

export const updateUser = async (req, res, next) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        
        // Validation des champs
        if (!name && !email && !newPassword) {
            return next(new ApiError(400, 'Au moins un champ à mettre à jour est requis'));
        }

        // Préparer les mises à jour
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (newPassword) {
            if (!currentPassword) {
                return next(new ApiError(400, 'Le mot de passe actuel est requis pour changer le mot de passe'));
            }
            updates.newPassword = newPassword;
            updates.currentPassword = currentPassword;
        }

        const updatedUser = await authService.updateUser(req.user._id, updates);
        res.json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
}; 