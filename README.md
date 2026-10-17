# React + Axios with Node.js & Turso Database

A complete, clean demonstration of a modern React frontend consuming a Node.js (Express) REST API backed by a [Turso](https://turso.tech/) (LibSQL) database using environment variables.

Based on the relational schema defined in [`schema.md`](./schema.md) (`User`, `Product`, `Order`, `Order_Product`).

---

## 📁 Project Structure

```text
react-axios/
├── prd.md               # Product Requirements Document (Full specification)
├── schema.md            # Turso SQLite Schema (User, Product, Order, Order_Product)
├── README.md            # Quickstart and setup guide
├── .gitignore           # Git ignore protecting secrets & dependencies
├── server/              # Express backend with Turso database connection
│   ├── .env.example     # Template for backend environment variables
│   ├── .env             # Turso URL and Auth Token configuration
│   └── src/
│       ├── config/db.js # Turso LibSQL client & auto table initialization
│       ├── controllers/ # CRUD handlers (product, user, order)
│       ├── routes/      # Express API routes (/api/products, /api/users, /api/orders)
│       └── index.js     # Server entry point (port 5001)
└── client/              # React frontend (Vite)
    ├── .env.example     # Template for client environment variables
    ├── .env             # API base URL configuration (port 5001)
    └── src/
        ├── api/         # Axios instance and API call services (productApi.js)
        ├── components/  # ProductForm, ProductList, StatusAlert
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
   ```

3. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5001` and automatically initialize `User`, `Product`, `Order`, and `Order_Product` tables on Turso.

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

## 📡 API Endpoints

- **Products:** `http://localhost:5001/api/products` (`GET`, `POST`, `PUT /:id`, `DELETE /:id`)
- **Users:** `http://localhost:5001/api/users` (`GET`, `POST`, `PUT /:id`, `DELETE /:id`)
- **Orders:** `http://localhost:5001/api/orders` (`GET`, `POST`, `PUT /:id/status`)
- **Health:** `http://localhost:5001/api/health`
