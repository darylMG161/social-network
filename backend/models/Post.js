const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu du post est requis"],
      maxlength: 2000,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
