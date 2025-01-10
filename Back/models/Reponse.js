import mongoose from "mongoose";

const reponseSchema = new mongoose.Schema({
  sondage_id: { type: mongoose.Schema.Types.ObjectId, ref: "Sondage", required: true },
  utilisateur_id: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur", required: true },
  reponses: [
    {
      question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      reponse: mongoose.Schema.Types.Mixed, // Peut être une chaîne ou un tableau pour les QCM
    },
  ],
});

const Reponse = mongoose.model("Reponse", reponseSchema);
export default Reponse;
