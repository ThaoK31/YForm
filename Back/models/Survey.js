import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    text: { 
        type: String, 
        required: true,
        trim: true,  // Enlève les espaces
        minLength: 3 // Longueur minimum
    },
    type: { 
        type: String, 
        enum: ["open", "mcq", "yes/no"], 
        required: true 
    },
    options: {
        type: [String],
        validate: {
            // Fonction qui vérifie si les options sont valides
            validator: function(options) {
                return this.type !== "mcq" || (options && options.length >= 2);
            },
            message: "Les questions MCQ doivent avoir au moins 2 options"
        }
    },
    order: {
        type: Number,
        default: 0 // Pour gérer l'ordre des questions
    }
});

const surveySchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence vers l'utilisateur créateur
    questions: [questionSchema],
    created_at: { type: Date, default: Date.now }, 
});

// Middleware pre-save pour s'assurer que l'ordre est correct si non spécifié
surveySchema.pre('save', function(next) {
    // Si les questions n'ont pas d'ordre défini, attribuer un ordre basé sur leur position dans le tableau
    this.questions.forEach((question, index) => {
        if (question.order === 0) {
            question.order = index + 1;
        }
    });
    
    // Trier les questions par ordre
    this.questions.sort((a, b) => a.order - b.order);
    
    next();
});

const Survey = mongoose.model("Survey", surveySchema);
export default Survey; 