import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";

export default function ChatWindow({ conversationUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charge l'historique de la conversation
  useEffect(() => {
    if (!conversationUser) return;
    api.get(`/messages/${conversationUser._id}`).then(({ data }) => {
      setMessages(data.messages);
    });
  }, [conversationUser]);

  // Écoute les événements temps réel
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleReceive(message) {
      const isCurrentConversation =
        message.sender._id === conversationUser?._id || message.sender._id === user._id;
      if (isCurrentConversation) {
        setMessages((prev) => [...prev, message]);
      }
    }

    function handleSent(message) {
      setMessages((prev) => [...prev, message]);
    }

    function handleTyping({ userId }) {
      if (userId === conversationUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    }

    socket.on("message:receive", handleReceive);
    socket.on("message:sent", handleSent);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:sent", handleSent);
      socket.off("typing", handleTyping);
    };
  }, [conversationUser, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleTypingInput(value) {
    setText(value);
    const socket = getSocket();
    if (socket && conversationUser) {
      socket.emit("typing", { recipientId: conversationUser._id });
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !conversationUser) return;

    const socket = getSocket();
    socket.emit("message:send", { recipientId: conversationUser._id, content: text });
    setText("");
  }

  if (!conversationUser) {
    return (
      <div className="chat-empty">
        <p>Sélectionnez une conversation pour commencer à discuter.</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar-circle">{conversationUser.username[0].toUpperCase()}</div>
        <span>{conversationUser.username}</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMine = msg.sender._id === user._id;
          return (
            <div key={msg._id} className={`bubble-row ${isMine ? "mine" : "theirs"}`}>
              <div className="bubble">{msg.content}</div>
            </div>
          );
        })}
        {isTyping && <div className="typing-indicator">{conversationUser.username} écrit...</div>}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Écrire un message..."
          value={text}
          onChange={(e) => handleTypingInput(e.target.value)}
        />
        <button type="submit" className="btn-accent" disabled={!text.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
