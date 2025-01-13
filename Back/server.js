import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from './middleware/errorHandler.js';

// Routes
import surveysRoutes from "./routes/surveys.js";
import usersRoutes from "./routes/users.js";
import responsesRoutes from "./routes/responses.js";

dotenv.config();
const app = express();

// Connexion à la base de données seulement si on n'est pas en test
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/surveys", surveysRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/responses", responsesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Démarrer le serveur seulement si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
}

export default app; 