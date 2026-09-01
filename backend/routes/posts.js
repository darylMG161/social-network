const express = require("express");
const {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getFeed);
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);

module.exports = router;
