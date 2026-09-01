import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}`).then(({ data }) => {
      setProfile(data.user);
      setIsFollowing(data.user.followers?.includes(currentUser?._id));
    });
  }, [id, currentUser]);

  async function handleFollow() {
    setIsFollowing((prev) => !prev);
    const { data } = await api.post(`/users/${id}/follow`);
    setIsFollowing(data.following);
  }

  if (!profile) {
    return (
      <div className="layout">
        <Navbar />
        <main className="feed">
          <p className="empty-state">Chargement du profil...</p>
        </main>
      </div>
    );
  }

  const isOwnProfile = profile._id === currentUser?._id;

  return (
    <div className="layout">
      <Navbar />

      <main className="feed">
        <div className="profile-header">
          <div className="avatar-circle large">{profile.username[0].toUpperCase()}</div>
          <div>
            <h1>{profile.username}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <span>
                <strong>{profile.followers?.length || 0}</strong> abonnés
              </span>
              <span>
                <strong>{profile.following?.length || 0}</strong> abonnements
              </span>
            </div>
          </div>

          {!isOwnProfile && (
            <button className="btn-accent" onClick={handleFollow}>
              {isFollowing ? "Ne plus suivre" : "Suivre"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
