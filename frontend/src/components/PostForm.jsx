import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PostForm({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/posts", { content });
      onPostCreated(data.post);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="avatar-circle">{user?.username?.[0]?.toUpperCase()}</div>
      <div className="post-form-body">
        <textarea
          placeholder="Partagez quelque chose avec votre cercle..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={2}
        />
        <div className="post-form-footer">
          <span className="char-count">{content.length}/2000</span>
          <button type="submit" className="btn-accent" disabled={!content.trim() || submitting}>
            Publier
          </button>
        </div>
      </div>
    </form>
  );
}
