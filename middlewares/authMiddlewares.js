const jwt = require('jsonwebtoken');

// Middleware pour verifier le token
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Extraire le token de l'en-tête
  
  if (!token) {
    return res.status(401).json({ error: 'Accès non autorise, token manquant' });
  }

  const secretKey = 'your_jwt_secret';  // Assurez-vous d'utiliser la même cle secrète ici

  // Verification du token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("Erreur JWT: ", err);  // Log pour examiner l'erreur du token
      return res.status(401).json({ error: 'Token invalide' });
    }

    console.log("Decoded token:", decoded);  // Log du token decode pour verifier son contenu

    // Verification de la presence de l'ID utilisateur dans le token
    if (!decoded || !decoded.utilisateurId) {
      return res.status(400).json({ error: 'ID utilisateur manquant dans le token' });
    }

    req.utilisateur = decoded;  // Ajouter l'utilisateur decode à la requête
    next();
  });
};

module.exports = authMiddleware;
