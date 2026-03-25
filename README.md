# 🌐 SocialApp — Mini Social Post Application

> A full-stack social feed application inspired by TaskPlanet's Social page.
> Built as part of the **3W Full Stack Internship Assignment**.

![Social Feed Preview](https://via.placeholder.com/800x400/2563eb/ffffff?text=SocialApp+Feed+Screenshot)

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | [your-app.vercel.app](https://your-app.vercel.app) |
| 🔌 Backend API | [your-api.onrender.com](https://your-api.onrender.com/api/health) |

---

## ✨ Features

- 🔐 **Authentication** — Signup & login with JWT. Passwords hashed with bcrypt.
- 📝 **Create Posts** — Post text, image, or both. Drag & drop image upload.
- 📰 **Public Feed** — See posts from all users, newest first. Paginated.
- ❤️ **Like System** — Toggle likes with optimistic UI (instant feedback).
- 💬 **Comments** — Add comments that appear instantly without page reload.
- 🗑️ **Delete Posts** — Authors can delete their own posts.
- 📱 **Responsive** — Mobile-first design inspired by TaskPlanet.
- ⚡ **Optimistic UI** — Likes and comments update instantly, no waiting.
- 🦴 **Skeleton Loading** — Shimmer placeholders while content loads.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | Custom CSS (no Tailwind) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
social-app/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Post.js          # Post schema (with embedded comments)
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   └── PostCard.js   # Like + comment logic here
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Feed.js
        │   ├── Login.js
        │   ├── Signup.js
        │   └── CreatePost.js
        ├── services/
        │   └── api.js        # All fetch() calls centralized
        ├── App.js
        └── App.css
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/social-app.git
cd social-app
```

### 2. Set up the Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/socialapp
JWT_SECRET=your_long_random_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
```

Create `.env` in the frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:
```bash
npm start
```

App runs at **http://localhost:3000** 🎉

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

**Signup body:**
```json
{ "username": "ramswaroop", "email": "ram@example.com", "password": "secret123" }
```

**Login response:**
```json
{ "token": "eyJhbGci...", "user": { "_id": "...", "username": "ramswaroop" } }
```

### Post Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts?page=1&limit=10` | ❌ | Paginated public feed |
| POST | `/api/posts` | ✅ | Create post |
| PUT | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/comment` | ✅ | Add comment |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "ramswaroop",
  "email": "ram@example.com",
  "password": "$2a$10$hashed...",
  "avatar": "",
  "bio": "",
  "createdAt": "2026-03-24T..."
}
```

### Posts Collection
```json
{
  "_id": "ObjectId",
  "author": "ObjectId",
  "username": "ramswaroop",
  "text": "🏆 I secured rank in TaskPlanet Leaderboard!",
  "image": "data:image/png;base64,...",
  "likes": ["userId1", "userId2"],
  "comments": [
    {
      "_id": "ObjectId",
      "user": "ObjectId",
      "username": "tejas9v7i",
      "text": "Congratulations! 🎉",
      "createdAt": "..."
    }
  ],
  "createdAt": "2026-03-24T..."
}
```

---

## 🚀 Deployment

### MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Add database user with read/write permissions
3. Whitelist IP `0.0.0.0/0` (allow from anywhere)
4. Copy connection string → use as `MONGO_URI`

### Backend → Render
1. Push code to GitHub
2. New Web Service on [render.com](https://render.com)
3. Root directory: `backend`
4. Build: `npm install` | Start: `npm start`
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`

### Frontend → Vercel
1. New Project on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Framework: Create React App
4. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
5. Deploy!

---

## 📸 Screenshots

| Feed | Create Post | Login |
|------|------------|-------|
| ![Feed](https://via.placeholder.com/200x400/f1f5f9/2563eb?text=Feed) | ![Create](https://via.placeholder.com/200x400/f1f5f9/2563eb?text=Create+Post) | ![Login](https://via.placeholder.com/200x400/f1f5f9/2563eb?text=Login) |

> Replace placeholder images with actual screenshots after deployment.

---

## 🏆 Bonus Features Implemented

- ✅ Pagination with "Load More" button
- ✅ Optimistic UI for likes and comments
- ✅ Skeleton loading cards
- ✅ Drag & drop image upload
- ✅ Character limit counter on posts
- ✅ Relative timestamps ("2h ago")
- ✅ Delete own posts (with confirmation)
- ✅ JWT auto-refresh on page load
- ✅ Reusable components (PostCard, Navbar)
- ✅ Centralized API service layer
- ✅ Clean error handling with UX feedback

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: you@example.com

---

## 📄 License

This project was built as part of the 3W Full Stack Internship Assignment.
