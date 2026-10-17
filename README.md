# React + Axios with Node.js & Turso Database

A complete, clean demonstration of a modern React frontend consuming a Node.js (Express) REST API backed by a [Turso](https://turso.tech/) (LibSQL) database using environment variables.

---

## 📁 Project Structure

```text
react-axios/
├── prd.md               # Product Requirements Document
├── README.md            # Quickstart and setup guide
├── server/              # Express backend with Turso database connection
│   ├── .env.example     # Template for backend environment variables
│   ├── .env             # Turso URL and Auth Token configuration
│   └── src/
│       ├── config/db.js # Turso LibSQL client initialization
│       ├── controllers/ # CRUD handlers
│       ├── routes/      # Express API routes
│       └── index.js     # Server entry point (port 5000)
└── client/              # React frontend (Vite)
    ├── .env.example     # Template for client environment variables
    ├── .env             # API base URL configuration
    └── src/
        ├── api/         # Axios instance and API call services
        ├── components/  # ItemForm, ItemList, StatusAlert
        └── App.jsx      # Main application state and UI
```

---

## 🚀 Quick Start Guide

### 1. Server Setup

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5001
   CLIENT_URL=http://localhost:5173

   # Turso Cloud credentials:
   TURSO_DATABASE_URL=libsql://your-db-name-org.turso.io
   TURSO_AUTH_TOKEN=your-turso-jwt-token

   # (Note: For local SQLite testing without a Turso cloud account, you can use:
   # TURSO_DATABASE_URL=file:local.db
   # TURSO_AUTH_TOKEN=)
   ```

3. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5001` and automatically create the `items` table if it does not exist.

---

### 2. Client Setup

1. Open a new terminal and navigate to `client/`:
   ```bash
   cd client
   npm install
   ```

2. Verify `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 🛠️ Turso Setup Cheatsheet

If you are using Turso Cloud:

1. **Install Turso CLI:**
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
2. **Log in:**
   ```bash
   turso auth signup  # or turso auth login
   ```
3. **Create a Database:**
   ```bash
   turso db create react-axios-db
   ```
4. **Get Database URL:**
   ```bash
   turso db show react-axios-db --url
   # Example output: libsql://react-axios-db-yourname.turso.io
   ```
5. **Generate Auth Token:**
   ```bash
   turso db tokens create react-axios-db
   ```
6. Paste both values into `server/.env` under `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

