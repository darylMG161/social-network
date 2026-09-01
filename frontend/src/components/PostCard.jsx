import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CommentSection from "./CommentSection";

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  const intervals = [
    { label: "an", secs: 31536000 },
    { label: "mois", secs: 2592000 },
    { label: "j", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "min", secs: 60 },
  ];
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}`;
  }
  return "à l'instant";
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const isAuthor = post.author._id === user?._id;

  async function handleLike() {
    // Mise à jour optimiste de l'interface
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      // Rollback en cas d'échec réseau
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette publication ?")) return;
    await api.delete(`/posts/${post._id}`);
    onDeleted?.(post._id);
  }

  function handleCommentAdded(comment) {
    setComments((prev) => [...prev, comment]);
  }

  return (
    <article className="post">
      <div className="post-header">
        <div className="avatar-circle">{post.author.username[0].toUpperCase()}</div>
        <div className="post-meta">
          <span className="post-author">{post.author.username}</span>
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
        {isAuthor && (
          <button className="link-button subtle" onClick={handleDelete}>
            Supprimer
          </button>
        )}
      </div>

      <p className="post-content">{post.content}</p>

      {post.imageUrl && <img src={post.imageUrl} alt="" className="post-image" />}

      <div className="post-actions">
        <button className={`action-link ${liked ? "is-active" : ""}`} onClick={handleLike}>
          {liked ? "Aimé" : "Aimer"} · {likesCount}
        </button>
        <button className="action-link" onClick={() => setShowComments((v) => !v)}>
          Commenter · {comments.length}
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={comments}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </article>
  );
}
