# ◐ Cercle — Réseau Social Sécurisé Full-Stack

Application de réseau social complète : publications avec likes et commentaires, messagerie instantanée en temps réel, et authentification sécurisée. Construite avec **React**, **Node.js/Express**, **MongoDB** et **WebSocket (Socket.IO)**.

---

## ✨ Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| 🔐 Authentification sécurisée | JWT, mots de passe hashés (bcrypt, 12 rounds), rate-limiting anti brute-force |
| 📝 Publications | Créer, supprimer, liker/déliker (toggle), commenter |
| 💬 Chat temps réel | Messagerie privée via WebSocket, indicateur de frappe, statut en ligne |
| 👥 Réseau social | Profils utilisateurs, système d'abonnement (follow/unfollow) |
| 🛡️ Sécurité API | Helmet (en-têtes HTTP), CORS restreint, validation des entrées, rate limiting |
| 🎨 Interface soignée | Design distinctif (palette papier chaud, typographie Fraunces/Work Sans) |

---

## 🏗️ Architecture

```
social-network/
├── backend/                     # API Express + MongoDB + Socket.IO
│   ├── server.js                 # Point d'entrée du serveur
│   ├── config/db.js               # Connexion MongoDB
│   ├── models/                    # Schémas Mongoose (User, Post, Comment, Message)
│   ├── middleware/                 # Auth JWT, gestion d'erreurs
│   ├── controllers/                # Logique métier
│   ├── routes/                     # Endpoints REST
│   ├── sockets/chatSocket.js       # Chat temps réel authentifié
│   └── .env.example
│
└── frontend/                    # Application React (Vite)
    ├── src/
    │   ├── api/                    # Client Axios + client Socket.IO
    │   ├── context/AuthContext.jsx  # État d'authentification global
    │   ├── components/              # Navbar, PostCard, ChatWindow, etc.
    │   └── pages/                   # Home, Login, Register, Chat, Profile
    └── .env.example
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- MongoDB (local ou instance Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditez .env : renseignez MONGO_URI et un JWT_SECRET robuste
npm run dev
```

L'API démarre sur **http://localhost:5000**.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

> ⚠️ Le backend doit être lancé avant le frontend pour que l'authentification et le chat fonctionnent.

---

## ⚙️ Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port du serveur API (défaut : 5000) |
| `MONGO_URI` | URI de connexion MongoDB |
| `JWT_SECRET` | Secret de signature JWT — **à changer impérativement en production** |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex : `7d`) |
| `CLIENT_URL` | URL du frontend (pour la config CORS) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API REST |
| `VITE_SOCKET_URL` | URL du serveur Socket.IO |

---

## 🔒 Sécurité mise en œuvre

- **Mots de passe** : hashés avec bcrypt (12 rounds de sel), jamais renvoyés dans les réponses API.
- **JWT** : authentification stateless, vérifiée sur chaque requête protégée et sur chaque connexion Socket.IO.
- **Rate limiting** : limite globale sur l'API + limite stricte dédiée sur `/auth/login` pour contrer le brute-force.
- **Validation des entrées** : `express-validator` sur les routes d'inscription/connexion.
- **En-têtes HTTP** : `helmet` pour les protections standards (XSS, sniffing, clickjacking...).
- **CORS** : restreint à l'origine du frontend configurée.

---

## 🧠 Fonctionnement du chat temps réel

1. Le frontend se connecte à Socket.IO en transmettant le JWT dans `handshake.auth.token`.
2. Le serveur valide ce token via un middleware Socket.IO dédié (`authenticateSocket`) — toute connexion sans token valide est rejetée.
3. Chaque utilisateur rejoint une room privée (`user:<id>`) lui permettant de recevoir ses messages où qu'il soit connecté (multi-onglets).
4. Les messages sont persistés en base (MongoDB) puis diffusés instantanément au destinataire s'il est en ligne.
5. Un événement `typing` informe l'interlocuteur en temps réel.

---

## 🗺️ Roadmap

- [ ] Upload d'images pour les publications et avatars (S3 / Cloudinary)
- [ ] Notifications (likes, commentaires, nouveaux abonnés)
- [ ] Pagination infinie du fil d'actualité
- [ ] Chiffrement de bout en bout des messages privés
- [ ] Tests automatisés (Jest / React Testing Library)
- [ ] Conteneurisation Docker + docker-compose

---

## 🤝 Contribuer

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Distribué sous licence MIT — voir [LICENSE](LICENSE).

## 👤 Auteur

Développé par **Daryl** — Full-Stack Developer, spécialisé en Blockchain et Cybersécurité.
