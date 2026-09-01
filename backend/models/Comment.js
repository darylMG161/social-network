const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu du commentaire est requis"],
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
