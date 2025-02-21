import express from 'express';
import { auth } from '../middleware/auth.js';
import { register, login, getCurrentUser } from '../controllers/authController.js';

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

// Route: POST /api/auth/logout
// Description: Déconnexion (côté client uniquement)
// Accès: Public
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

export default router; 