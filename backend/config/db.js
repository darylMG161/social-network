const mongoose = require("mongoose");

/**
 * Établit la connexion à MongoDB via Mongoose.
 * Le processus s'arrête si la connexion échoue au démarrage,
 * pour éviter de faire tourner une API sans base de données.
 */
async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI n'est pas défini dans le fichier .env");
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
