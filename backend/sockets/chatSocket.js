const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

// Associe un userId à son (ou ses) socket.id actif(s)
const onlineUsers = new Map();

/**
 * Middleware Socket.IO : authentifie la connexion via le JWT transmis
 * dans `socket.handshake.auth.token`. Rejette la connexion si le token
 * est absent ou invalide — empêche toute connexion anonyme au chat.
 */
function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentification requise."));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Token invalide."));
  }
}

function registerChatHandlers(io) {
  io.use(authenticateSocket);

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    // Enregistre l'utilisateur comme en ligne
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("presence:update", { userId, online: true });

    // Rejoint une "room" personnelle pour recevoir facilement ses messages
    socket.join(`user:${userId}`);

    /**
     * Événement "message:send"
     * payload: { recipientId, content }
     */
    socket.on("message:send", async ({ recipientId, content }, callback) => {
      try {
        if (!recipientId || !content || !content.trim()) {
          return callback?.({ error: "Destinataire et contenu requis." });
        }

        const message = await Message.create({
          sender: userId,
          recipient: recipientId,
          content: content.trim(),
        });

        await message.populate("sender", "username avatarUrl");

        // Envoie le message au destinataire s'il est connecté
        io.to(`user:${recipientId}`).emit("message:receive", message);
        // Confirme l'envoi à l'expéditeur (utile multi-onglets)
        socket.emit("message:sent", message);

        callback?.({ success: true, message });
      } catch (error) {
        callback?.({ error: "Échec de l'envoi du message." });
      }
    });

    /**
     * Événement "typing"
     * Indique à l'interlocuteur que l'utilisateur est en train d'écrire.
     */
    socket.on("typing", ({ recipientId }) => {
      io.to(`user:${recipientId}`).emit("typing", { userId });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });
  });
}

module.exports = { registerChatHandlers, onlineUsers };
