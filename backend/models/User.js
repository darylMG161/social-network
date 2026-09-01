const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est requis"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: 8,
      select: false, // jamais renvoyé par défaut dans les requêtes
    },
    bio: {
      type: String,
      maxlength: 200,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hash automatique du mot de passe avant sauvegarde
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode d'instance pour comparer un mot de passe en clair au hash stocké
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ne jamais exposer le hash du mot de passe dans les réponses JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", UserSchema);
