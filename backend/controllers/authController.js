const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur.
 */
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email ou nom d'utilisateur déjà utilisé." });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authentifie un utilisateur existant et renvoie un JWT.
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // On sélectionne explicitement le password (exclu par défaut du schéma)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = generateToken(user._id);

    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Renvoie le profil de l'utilisateur actuellement authentifié.
 */
async function getMe(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { register, login, getMe };
