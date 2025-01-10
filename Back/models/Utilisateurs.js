import mongoose from "mongoose";
import bcrypt from "bcrypt";

const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  motDePasse: { type: String, required: true },
  dateInscription: { type: Date, default: Date.now },
});

// Méthode pour hasher le mot de passe avant de sauvegarder
utilisateurSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer le mot de passe lors de la connexion
utilisateurSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.motDePasse);
};

const Utilisateur = mongoose.model("Utilisateur", utilisateurSchema);
export default Utilisateur;
