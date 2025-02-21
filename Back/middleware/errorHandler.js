// Classe personnalisée pour les erreurs de l'API
export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    // Log détaillé de l'erreur
    console.error('❌ Erreur détectée :', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ 
            error: 'Erreur de validation',
            details: errors
        });
    }

    // Erreurs de doublon (index unique)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ 
            error: `Cette valeur de ${field} existe déjà`,
            field: field
        });
    }

    // Erreur de cast MongoDB (ID invalide)
    if (err.name === 'CastError') {
        return res.status(400).json({ 
            error: 'Format d\'identifiant invalide',
            field: err.path
        });
    }

    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expiré'
        });
    }

    // Erreurs personnalisées de l'API
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    // Erreur serveur par défaut
    res.status(500).json({ 
        error: 'Erreur serveur interne'
    });
};

export default errorHandler; 