import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">◐</span>
        <span className="brand-name">Cercle</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Fil d'actualité
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")}>
          Messages
        </NavLink>
        <NavLink to={`/profile/${user?._id}`} className={({ isActive }) => (isActive ? "active" : "")}>
          Mon profil
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="mini-profile">
          <div className="avatar-circle">{user?.username?.[0]?.toUpperCase()}</div>
          <span>{user?.username}</span>
        </div>
        <button className="link-button" onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
