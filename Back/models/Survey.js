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
    }
});

const surveySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence vers l'utilisateur créateur
    questions: [questionSchema],
    created_at: { type: Date, default: Date.now }, 
});

// Ajouter un index pour améliorer les performances
surveySchema.index({ name: 1 }, { unique: true });

const Survey = mongoose.model("Survey", surveySchema);
export default Survey; 