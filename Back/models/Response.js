import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    survey_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Survey", 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    answers: [{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        value: {
            type: String,
            required: true,
            trim: true
        }
    }],
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Vérifier que l'utilisateur n'a pas déjà répondu au sondage
responseSchema.index({ survey_id: 1, user_id: 1 }, { unique: true });

const Response = mongoose.model("Response", responseSchema);
export default Response; 