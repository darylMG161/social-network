const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu du message est requis"],
      maxlength: 2000,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index composé pour récupérer rapidement une conversation entre 2 utilisateurs
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
