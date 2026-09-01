const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/users/:id
 * Récupère le profil public d'un utilisateur.
 */
router.get("/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:id/follow
 * Suit / ne plus suivre un utilisateur (toggle).
 */
router.post("/:id/follow", protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même." });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const alreadyFollowing = req.user.following.some(
      (id) => id.toString() === targetId
    );

    if (alreadyFollowing) {
      req.user.following = req.user.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      req.user.following.push(targetId);
      targetUser.followers.push(req.user._id);
    }

    await req.user.save();
    await targetUser.save();

    res.status(200).json({ following: !alreadyFollowing });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users
 * Recherche d'utilisateurs par nom d'utilisateur (pour démarrer une conversation).
 */
router.get("/", protect, async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { username: { $regex: search, $options: "i" } }
      : {};

    const users = await User.find(filter).limit(20);
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
