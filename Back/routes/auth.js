import express from 'express';
import { auth } from '../middleware/auth.js';
import { register, login, getCurrentUser, updateUser } from '../controllers/authController.js';

const router = express.Router();

// Route: POST /api/auth/register
// Description: Inscription d'un utilisateur
// Accès: Public
router.post('/register', register);

// Route: POST /api/auth/login
// Description: Connexion d'un utilisateur
// Accès: Public
router.post('/login', login);

// Route: GET /api/auth/me
// Description: Obtenir l'utilisateur connecté
// Accès: Privé
router.get('/me', auth, getCurrentUser);

// Route: PUT /api/auth/me
// Description: Mettre à jour le profil de l'utilisateur
// Accès: Privé
router.put('/me', auth, updateUser);

// Route: POST /api/auth/logout
// Description: Déconnexion (côté client uniquement)
// Accès: Public
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

export default router; 