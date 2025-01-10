import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  intitule: { type: String, required: true },
  type: { type: String, enum: ["ouverte", "qcm","oui/non"], required: true },
  reponses: [String], // Options pour les QCM
});

const sondageSchema = new mongoose.Schema({
  nom: { type: String, unique: true, required: true },
  createur: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateur" }, // Référence vers un utilisateur
  questions: [questionSchema],
  date_creation: { type: Date, default: Date.now },
});

const Sondage = mongoose.model("Sondage", sondageSchema);
export default Sondage;
