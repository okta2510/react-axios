# Node.js + Express API Server with Turso Database

RESTful API backend powered by **Express** and connected to **Turso (LibSQL Cloud)**. This server handles data persistence, relational modeling (`User`, `Product`, `Order`, `Order_Product`), stock deduction, and user authentication for the React + Axios client.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js (v18+ or v20+)
- **Framework:** Express.js (v4)
- **Database Client:** `@libsql/client` (Official SDK for Turso SQLite)
- **CORS:** `cors` (Configured for Vite client on `http://localhost:5173`)
- **Environment Management:** `dotenv` (Auto-reads from `server/.env` and parent `.env.local`)

---

## 📁 Directory Structure

```text
server/
├── README.md               # Backend documentation and API guide
├── package.json            # Dependencies and npm scripts
├── .env.example            # Environment variables template
├── .env                    # Active environment variables (git-ignored)
├── .gitignore              # Ignores node_modules, .env, and local .db files
└── src/
    ├── config/
    │   └── db.js           # Turso LibSQL client initialization & auto schema bootstrap
    ├── controllers/
    │   ├── productController.js # Product CRUD handlers
    │   ├── userController.js    # User authentication & management handlers
    │   └── orderController.js   # Order placement, stock deduction & history handlers
    ├── routes/
    │   ├── apiRoutes.js    # Main consolidated router (/api)
    │   └── itemRoutes.js   # Legacy compatibility routes
    └── index.js            # Express application entry point (Port 5001)
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside the `server/` folder (or copy from `.env.example`):

```bash
cp .env.example .env
```

Set the following variables:

```env
# Server Listening Port (5001 recommended on macOS to avoid AirPlay conflict on 5000)
PORT=5001

# Allowed Frontend Client Origin
CLIENT_URL=http://localhost:5173

# Turso Cloud Database Credentials
TURSO_DATABASE_URL=libsql://your-database-name-organization.turso.io
TURSO_AUTH_TOKEN=your_turso_jwt_auth_token_here

# (Optional fallback for local offline testing):
# TURSO_DATABASE_URL=file:local.db
# TURSO_AUTH_TOKEN=
```

> **Note:** The server is also configured to automatically read Turso credentials from the root `.env.local` if present.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
*(Runs with `node --watch` for hot reload on file changes)*

### 3. Run Production Mode
```bash
npm start
```

Upon startup, the server automatically checks and bootstraps tables from `schema.md` if they do not yet exist:
- `User`
- `Product`
- `Order`
- `Order_Product`

---

## 📡 REST API Reference

**Base URL:** `http://localhost:5001/api`

### 1. Health Check
- **`GET /api/health`**
  - Response (`200 OK`):
    ```json
    {
      "status": "ok",
      "message": "Node server with Turso database connection is healthy",
      "timestamp": "2026-10-17T08:00:00.000Z"
    }
    ```

---

### 2. Authentication & Users (`/api/auth`, `/api/users`)

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User login | `{ "email": "...", "password": "..." }` | `200` / `401` |
| `GET` | `/api/users` | List all users | None | `200 OK` |
| `GET` | `/api/users/:id` | Get user by ID | None | `200` / `404` |
| `POST` | `/api/users` | Register new user | `{ "name": "...", "email": "...", "password": "...", "role": "customer" }` | `201` / `409` |
| `PUT` | `/api/users/:id` | Update user | `{ "name": "...", "role": "...", "status": "..." }` | `200` / `404` |
| `DELETE` | `/api/users/:id` | Delete user | None | `200` / `404` |

---

### 3. Products (`/api/products`)

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products | None | `200 OK` |
| `GET` | `/api/products/:id` | Get product details | None | `200` / `404` |
| `POST` | `/api/products` | Create product | `{ "name": "...", "price": 49.99, "category": "...", "stock": 50, "description": "...", "image_url": "..." }` | `201 Created` |
| `PUT` | `/api/products/:id` | Update product | `{ "name": "...", "price": 59.99, "stock": 45, ... }` | `200 OK` |
| `DELETE` | `/api/products/:id` | Delete product | None | `200 OK` |

---

### 4. Orders & Checkout (`/api/orders`)

| Method | Endpoint | Description | Request Body | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Get all orders with line items | None | `200 OK` |
| `GET` | `/api/orders?user_id=:id` | Filter orders by user | None | `200 OK` |
| `POST` | `/api/orders` | Place / Checkout order | `{ "user_id": 1, "products": [{ "product_id": 5, "quantity": 2 }] }` | `201` / `400` |
| `PUT` | `/api/orders/:id/status` | Update order status | `{ "status": "completed" \| "cancelled" }` | `200 OK` |
| `DELETE` | `/api/orders/:id` | Delete order | None | `200 OK` |

#### Order Placement Logic:
1. Validates that `user_id` exists.
2. Validates stock availability for each product in `Product` table.
3. Automatically computes `total_price` based on current product prices.
4. Creates entry in `Order` table.
5. Creates line item rows in `Order_Product` (Composite PK: `order_id` + `product_id`).
6. Atomically decrements product stock: `stock = stock - quantity`.

---

## 🔒 Security Best Practices

- **SQL Parameterization:** All SQL queries use `@libsql/client` parameter binding (`args: [...]`) to protect against SQL Injection.
- **Secrets Isolation:** `.env` and `.env.local` are omitted from version control in `.gitignore`.
- **CORS Control:** Restricts API access to the approved client domain in development and production.

