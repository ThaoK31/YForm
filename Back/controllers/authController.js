import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validation des champs
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    if (!email) return res.status(400).json({ message: 'L\'email est requis' });
    if (!password) return res.status(400).json({ message: 'Le mot de passe est requis' });

    if (password.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    try {
        const result = await authService.registerUser(name, email, password);
        res.status(201).json(result);
    } catch (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validation des champs
    if (!email) return res.status(400).json({ message: 'L\'email est requis' });
    if (!password) return res.status(400).json({ message: 'Le mot de passe est requis' });

    try {
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        res.status(401).json({ message: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const result = await authService.getCurrentUser(req.user._id);
        res.json(result);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(404).json({ message: error.message });
    }
}; 