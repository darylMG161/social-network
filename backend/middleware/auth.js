const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Vérifie la présence et la validité d'un token JWT dans l'en-tête
 * Authorization: Bearer <token>. Attache l'utilisateur authentifié
 * à req.user si le token est valide.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé : token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

module.exports = { protect };
