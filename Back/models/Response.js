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
        answer: mongoose.Schema.Types.Mixed // Peut être une chaîne de caractères ou un tableau pour les QCM
    }],
    submitted_at: { 
        type: Date, 
        default: Date.now 
    }
});

const Response = mongoose.model("Response", responseSchema);
export default Response; 