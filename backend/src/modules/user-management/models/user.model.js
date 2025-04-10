const UserSchema = new mongoose.Schema({
    skills: [String],         // Compétences de l'utilisateur
    experience: Number,       // Expérience du tuteur (0-100)
    availability: Boolean     // Disponibilité du tuteur
});