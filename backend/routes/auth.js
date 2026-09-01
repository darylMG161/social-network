const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Limite les tentatives de connexion pour se prémunir du brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Trop de tentatives de connexion. Réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caractères."),
    body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit contenir au moins 8 caractères."),
  ],
  register
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
    body("password").notEmpty().withMessage("Mot de passe requis."),
  ],
  login
);

router.get("/me", protect, getMe);

module.exports = router;
