import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { ApiError } from '../middleware/errorHandler.js';

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
};

const formatUserResponse = (user, token) => {
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    };
};

export const registerUser = async (name, email, password) => {
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new ApiError(409, 'Cet email est déjà utilisé');
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingName = await User.findOne({ name });
    if (existingName) {
        throw new ApiError(409, 'Ce nom d\'utilisateur est déjà utilisé');
    }

    // Créer l'utilisateur (le hashage est géré par le middleware pre-save)
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return formatUserResponse(user, token);
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, 'Identifiants invalides');
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
        throw new ApiError(401, 'Identifiants invalides');
    }

    const token = generateToken(user._id);
    return formatUserResponse(user, token);
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new ApiError(404, 'Utilisateur non trouvé');
    }
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

export const updateUser = async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'Utilisateur non trouvé');
    }

    // Vérifier si l'email est déjà utilisé
    if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({ email: updates.email });
        if (existingUser) {
            throw new ApiError(400, 'Cet email est déjà utilisé');
        }
    }

    // Vérifier si le nom d'utilisateur est déjà utilisé
    if (updates.name && updates.name !== user.name) {
        const existingUser = await User.findOne({ name: updates.name });
        if (existingUser) {
            throw new ApiError(400, 'Ce nom d\'utilisateur est déjà utilisé');
        }
    }

    // Si le mot de passe doit être mis à jour
    if (updates.newPassword) {
        // Vérifier l'ancien mot de passe
        const validPassword = await user.comparePassword(updates.currentPassword);
        if (!validPassword) {
            throw new ApiError(401, 'Mot de passe actuel incorrect');
        }
        user.password = updates.newPassword;
    }

    // Mettre à jour les autres champs
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;

    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
}; 