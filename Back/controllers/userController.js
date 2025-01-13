import * as userService from '../services/userService.js';

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    // Field validation
    if (!name) return res.status(400).json({ error: 'Le champ "nom" est obligatoire.' });
    if (!email) return res.status(400).json({ error: 'Le champ "email" est obligatoire.' });
    if (!password) return res.status(400).json({ error: 'Le champ "mot de passe" est obligatoire.' });

    if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    try {
        const user = await userService.createUser(name, email, password);
        res.status(201).json({ message: 'Utilisateur créé avec succès', id: user._id });
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur :', error);
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: 'Le champ "email" est obligatoire.' });
    if (!password) return res.status(400).json({ error: 'Le champ "mot de passe" est obligatoire.' });

    try {
        const { token, user } = await userService.loginUser(email, password);
        res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (error) {
        console.error('❌ Erreur lors de la connexion :', error);
        res.status(401).json({ error: error.message });
    }
}; 