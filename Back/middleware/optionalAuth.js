import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware d'authentification optionnelle
// Ne bloque pas la requête si le token est absent ou invalide
const optionalAuth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    // Si pas de token, continuer sans authentification
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id);
    if (!user) {
      // Si l'utilisateur n'existe pas, on continue sans authentification
      return next();
    }
    
    // Ajouter les infos de l'utilisateur à la requête
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (error) {
    // En cas d'erreur (token invalide), continuer sans authentification
    next();
  }
};

export default optionalAuth; 