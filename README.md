# E‑commerce Backend

Node.js + Express API for the Afternoon e‑commerce app. Handles auth, products, cart, users (admin), and contact inquiries.

## Prerequisites

- **Node.js** v18+ (or v16+)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in this folder (same level as `package.json`). Do not commit real secrets to Git.

Example:

```env
MONGODB_URI=mongodb://localhost:27017/yourdb
# Or MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/dbname

PORT=5001
NODE_ENV=development
JWT_SECRET=your_secure_random_secret_here
```

| Variable | Required | Description |
|---------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: 5000) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `NODE_ENV` | No | e.g. `development` or `production` |

### 3. (Optional) Create an admin user

After you have at least one user (sign up via the store or add via admin Users page), you can set their role to admin:

```bash
npm run set-admin -- user@example.com
```

Or set `role: "admin"` for that user in MongoDB.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the server (`node server.js`) |
| `npm run dev` | Run with nodemon (auto-restart on file changes) |
| `npm run seed` | Seed database (if you have a seed script) |
| `npm run set-admin -- <email>` | Set a user as admin by email |

## Running the server

```bash
npm start
```

Server runs at **http://localhost:5001** (or the `PORT` in `.env`).

## API base

- Base URL: `http://localhost:5001/api`
- The store and admin frontends use this URL (configurable via their env: `REACT_APP_API_URL` and `VITE_API_URL`).

## Main routes

- `GET/POST /api/auth/*` – login, register, me
- `GET/POST/PUT/DELETE /api/products` – products (GET public; create/update/delete admin)
- `GET/POST/PUT/DELETE /api/cart` – user cart (authenticated)
- `GET/POST/PATCH /api/users`, `GET/PATCH/DELETE /api/users/:id` – admin user management
- `POST /api/inquiries` – contact form (public); `GET/PATCH /api/inquiries` – admin list/update

Ensure the backend is running before using the store or admin dashboard.
