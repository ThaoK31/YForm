import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const createUser = async (name, email, password) => {
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new Error('Cet email est déjà utilisé');
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingName = await User.findOne({ name });
    if (existingName) {
        throw new Error('Ce nom d\'utilisateur est déjà utilisé');
    }

    // Créer le nouvel utilisateur
    const user = new User({
        name,
        email,
        password
    });

    await user.save();
    return user;
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Email ou mot de passe incorrect');
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
        throw new Error('Email ou mot de passe incorrect');
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return { token, user };
}; 