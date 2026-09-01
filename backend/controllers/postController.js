const Post = require("../models/Post");
const Comment = require("../models/Comment");

/**
 * GET /api/posts
 * Récupère le fil d'actualité, paginé, du plus récent au plus ancien.
 */
async function getFeed(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username avatarUrl")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username avatarUrl" },
      });

    const total = await Post.countDocuments();

    res.status(200).json({ posts, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/posts
 * Crée une nouvelle publication.
 */
async function createPost(req, res, next) {
  try {
    const { content, imageUrl } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Le contenu du post ne peut pas être vide." });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      imageUrl: imageUrl || "",
    });

    await post.populate("author", "username avatarUrl");

    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/posts/:id
 * Supprime une publication (auteur uniquement).
 */
async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ message: "Post supprimé." });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/posts/:id/like
 * Ajoute ou retire un like sur une publication (toggle).
 */
async function toggleLike(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({ likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/posts/:id/comments
 * Ajoute un commentaire à une publication.
 */
async function addComment(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content,
    });

    post.comments.push(comment._id);
    await post.save();
    await comment.populate("author", "username avatarUrl");

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

module.exports = { getFeed, createPost, deletePost, toggleLike, addComment };
