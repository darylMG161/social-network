require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { registerChatHandlers } = require("./sockets/chatSocket");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- Sécurité ---
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Limite globale anti-abus (hors login, géré séparément avec une limite plus stricte)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// --- Base de données ---
connectDB();

// --- Routes API ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// --- Gestion des routes inconnues ---
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée." });
});

// --- Gestion centralisée des erreurs ---
app.use(errorHandler);

// --- Socket.IO (chat temps réel) ---
const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});
registerChatHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, server, io };
