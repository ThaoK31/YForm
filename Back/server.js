import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from './middleware/errorHandler.js';

// Routes
import surveysRoutes from "./routes/surveys.js";
import responsesRoutes from "./routes/responses.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
export const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 heures de mise en cache des résultats preflight
  optionsSuccessStatus: 204
}));

// Protection supplémentaire contre les attaques courantes
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '10mb' })); // Limite la taille des requêtes JSON

// Routes
app.use("/api/auth", authRoutes);     // Routes d'authentification
app.use("/api/surveys", surveysRoutes);
app.use("/api/responses", responsesRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
} 