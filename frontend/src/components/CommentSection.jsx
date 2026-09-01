import React, { useState } from "react";
import api from "../api/axios";

export default function CommentSection({ postId, comments, onCommentAdded }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: text });
      onCommentAdded(data.comment);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="comment-section">
      {comments.map((comment) => (
        <div key={comment._id} className="comment">
          <span className="comment-author">{comment.author.username}</span>
          <span className="comment-text">{comment.content}</span>
        </div>
      ))}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Écrire un commentaire..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button type="submit" disabled={!text.trim() || submitting}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
