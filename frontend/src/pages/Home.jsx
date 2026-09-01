import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setLoading(true);
    try {
      const { data } = await api.get("/posts");
      setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }

  function handlePostCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handlePostDeleted(postId) {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }

  return (
    <div className="layout">
      <Navbar />

      <main className="feed">
        <h1 className="feed-title">Fil d'actualité</h1>
        <PostForm onPostCreated={handlePostCreated} />

        {loading ? (
          <p className="empty-state">Chargement du fil...</p>
        ) : posts.length === 0 ? (
          <p className="empty-state">
            Aucune publication pour l'instant. Soyez le premier à partager quelque chose.
          </p>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDeleted={handlePostDeleted} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
