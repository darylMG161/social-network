import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        api.get(`/users?search=${encodeURIComponent(search)}`).then(({ data }) => {
          setUsers(data.users);
        });
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="layout">
      <Navbar />

      <main className="chat-page">
        <aside className="conversation-list">
          <h2>Messages</h2>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="user-results">
            {users.map((u) => (
              <button
                key={u._id}
                className={`user-result ${activeConversation?._id === u._id ? "active" : ""}`}
                onClick={() => setActiveConversation(u)}
              >
                <div className="avatar-circle">{u.username[0].toUpperCase()}</div>
                <span>{u.username}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          <ChatWindow conversationUser={activeConversation} />
        </section>
      </main>
    </div>
  );
}
