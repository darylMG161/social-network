const Message = require("../models/Message");

/**
 * GET /api/messages/:userId
 * Récupère l'historique de conversation entre l'utilisateur connecté
 * et un autre utilisateur donné.
 */
async function getConversation(req, res, next) {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatarUrl")
      .populate("recipient", "username avatarUrl");

    // Marquer comme lus les messages reçus dans cette conversation
    await Message.updateMany(
      { sender: userId, recipient: myId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/messages
 * Envoie un message (fallback HTTP ; le chemin principal temps réel
 * passe par Socket.IO, voir sockets/chatSocket.js).
 */
async function sendMessage(req, res, next) {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ message: "Destinataire et contenu requis." });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content,
    });

    await message.populate("sender", "username avatarUrl");

    res.status(201).json({ message: message });
  } catch (error) {
    next(error);
  }
}

module.exports = { getConversation, sendMessage };
