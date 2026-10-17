# Product Requirements Document (PRD)
## Full-Stack React + Axios with Node.js API & Turso Database
### E-Commerce & Product Management System (Based on `schema.md`)

---

## 1. Executive Summary & Objective

### 1.1 Overview
This project is a modern full-stack web application designed to demonstrate robust client-server-database communication using:
- **Frontend:** React (powered by Vite) using **Axios** for clean, modular HTTP requests, interceptors, and state synchronization.
- **Backend:** Node.js with Express providing RESTful API endpoints.
- **Database:** **Turso** (distributed SQLite powered by LibSQL) accessed via official `@libsql/client`.
- **Configuration:** Strictly isolated configuration via environment variables (`.env` / `.env.local`).

### 1.2 Purpose & Scope
The application serves as a standard reference and learning module (e.g., for Dumet School students/developers) showing how to:
1. Model relational databases in Turso SQLite with foreign keys and cascading relationships.
2. Build REST APIs for E-Commerce resources: **Users** (Auth/Login/Register), **Products** (CRUD), and **Orders** (Checkout & Order_Product association).
3. Configure Axios client instances with custom baseURLs, headers, and response interceptors.
4. Deliver a seamless React UI featuring:
   - **Product CRUD**: Add, edit, delete, and view products with live stock tracking.
   - **User Authentication**: Log in as existing users, register new accounts, or switch demo users.
   - **Shopping Cart & Do Order**: Add items to cart, adjust quantities, calculate total price, place orders linked to `user_id`, deduct product stock, and inspect order history.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Key Dependencies / Tools | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite / React 18+) | `axios`, `lucide-react` (icons) | User Interface, Client-side state & API queries |
| **Backend** | Node.js | `express`, `cors`, `dotenv`, `@libsql/client` | REST API routes, business logic, Turso client |
| **Database** | Turso (LibSQL) | Cloud Database / `@libsql/client` | Serverless SQLite database at the edge |
| **Environment** | `.env` | `dotenv` (server), `VITE_API_BASE_URL` (client) | Secure configuration & secrets management |

---

## 3. System Architecture & Data Flow

```mermaid
flowchart LR
    subgraph Client ["Client (React App)"]
        UI["React UI (ProductCatalog, Forms)"]
        Axios["Axios API Client<br/>(baseURL, Interceptors)"]
        UI -->|Calls API Service| Axios
    end

    subgraph Server ["Node.js API Server (Express)"]
        Router["Express Router (/api)"]
        Controllers["Product, User & Order Controllers"]
        LibSQL["@libsql/client<br/>(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)"]
        Axios -->|HTTP Request (JSON)| Router
        Router --> Controllers
        Controllers --> LibSQL
    end

    subgraph Database ["Turso Database (LibSQL Cloud)"]
        TursoTables[("Turso Tables:<br/>User<br/>Product<br/>Order<br/>Order_Product")]
        LibSQL -->|libsql:// protocol| TursoTables
    end

    TursoTables -->|Query Results| LibSQL
    LibSQL --> Controllers
    Controllers -->|JSON Response| Router
    Router -->|HTTP Response 200/201/400/404/500| Axios
    Axios -->|State Update| UI
```

---

## 4. Environment Variables Configuration

### 4.1 Server (`server/.env` & `.env.local`)
All Turso credentials and server configurations must be stored securely and omitted from version control (`.gitignore`).

```env
# Server Port (5001 used to avoid macOS AirPlay conflict on 5000)
PORT=5001

# Turso Cloud Credentials
TURSO_DATABASE_URL=libsql://dumetschool-okta2510.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_jwt_auth_token_here

# Client Origin (CORS whitelist)
CLIENT_URL=http://localhost:5173
```

### 4.2 Client (`client/.env`)
```env
# Base URL pointing to the Node.js Express server
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 5. Database Schema & Data Models (from `schema.md`)

The application models an e-commerce platform with 4 relational SQLite tables:

### 5.1 DDL Schema (`schema.md`)

```sql
-- 1. User Table
CREATE TABLE `User` (
    `id` integer PRIMARY KEY AUTOINCREMENT,
    `name` text NOT NULL,
    `email` text NOT NULL UNIQUE,
    `password` text NOT NULL,
    `role` text DEFAULT 'customer',
    `status` text DEFAULT 'active'
);

-- 2. Product Table
CREATE TABLE `Product` (
    `id` integer PRIMARY KEY AUTOINCREMENT,
    `name` text NOT NULL,
    `price` real NOT NULL,
    `category` text,
    `stock` integer DEFAULT 0,
    `description` text,
    `image_url` text
);

-- 3. Order Table
CREATE TABLE `Order` (
    `id` integer PRIMARY KEY AUTOINCREMENT,
    `user_id` integer NOT NULL,
    `total_price` real DEFAULT 0,
    `status` text DEFAULT 'pending',
    `created_at` numeric DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_Order_user_id_User_id_fk` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`)
);

-- 4. Order_Product Table (Many-to-Many Association)
CREATE TABLE `Order_Product` (
    `order_id` integer NOT NULL,
    `product_id` integer NOT NULL,
    `quantity` integer DEFAULT 1,
    CONSTRAINT `Order_Product_pk` PRIMARY KEY(`order_id`, `product_id`),
    CONSTRAINT `fk_Order_Product_product_id_Product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_Order_Product_order_id_Order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE
);
```

---

## 6. REST API Specification

**Base URL:** `http://localhost:5001/api`

### 6.1 Product Endpoints (`/products`)
| Method | Endpoint | Description | Request Body | Response (Success) | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | List all products | None | `{ success: true, data: Product[] }` | `200 OK` |
| `GET` | `/products/:id` | Get product details | None | `{ success: true, data: Product }` | `200 OK` / `404 Not Found` |
| `POST` | `/products` | Create product | `{ name, price, category, stock, description, image_url }` | `{ success: true, data: Product }` | `201 Created` |
| `PUT` | `/products/:id` | Update product | `{ name?, price?, category?, stock?, description?, image_url? }` | `{ success: true, data: Product }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/products/:id` | Delete product | None | `{ success: true, message: "..." }` | `200 OK` / `404 Not Found` |

### 6.2 User Endpoints (`/users`)
| Method | Endpoint | Description | Request Body | Response (Success) | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | List all users | None | `{ success: true, data: User[] }` | `200 OK` |
| `GET` | `/users/:id` | Get user by ID | None | `{ success: true, data: User }` | `200 OK` / `404 Not Found` |
| `POST` | `/users` | Create new user | `{ name, email, password, role?, status? }` | `{ success: true, data: User }` | `201 Created` / `409 Conflict` |
| `PUT` | `/users/:id` | Update user | `{ name?, role?, status? }` | `{ success: true, data: User }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/users/:id` | Delete user | None | `{ success: true, message: "..." }` | `200 OK` / `404 Not Found` |

### 6.3 Order Endpoints (`/orders`)
| Method | Endpoint | Description | Request Body | Response (Success) | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/orders` | List orders with line items | None | `{ success: true, data: Order[] }` | `200 OK` |
| `POST` | `/orders` | Create order | `{ user_id, products: [{ product_id, quantity }] }` | `{ success: true, data: Order }` | `201 Created` |
| `PUT` | `/orders/:id/status` | Update order status | `{ status: "pending" \| "completed" \| "cancelled" }` | `{ success: true, data: Order }` | `200 OK` |

---

## 7. Project Directory Structure

```text
react-axios/
├── prd.md                     # Product Requirements Document
├── schema.md                  # Turso SQLite DDL definitions
├── README.md                  # Quickstart and setup guide
├── .gitignore                 # Root gitignore protecting secrets
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Environment variables (PORT=5001, TURSO_*)
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Turso connection & table bootstrap
│   │   ├── controllers/
│   │   │   ├── productController.js # Product CRUD handler
│   │   │   ├── userController.js    # User CRUD handler
│   │   │   └── orderController.js   # Order & Order_Product handler
│   │   ├── routes/
│   │   │   └── apiRoutes.js   # Consolidated Express router
│   │   └── index.js           # Server entry point & CORS
└── client/                    # React Frontend (Vite)
    ├── .env                   # VITE_API_BASE_URL=http://localhost:5001/api
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   ├── axiosClient.js # Axios instance with interceptors
        │   └── productApi.js  # Product API client methods
        ├── components/
        │   ├── ProductForm.jsx# Product creation & editing form
        │   ├── ProductList.jsx# Product catalog grid with cards & actions
        │   └── StatusAlert.jsx# Notification & error banner
        ├── App.jsx            # Main app state & views
        └── main.jsx           # React DOM root entry
```

---

## 8. Frontend Implementation Details

1. **Centralized Axios Client (`client/src/api/axiosClient.js`):**
   - Configures `baseURL` from `import.meta.env.VITE_API_BASE_URL`.
   - Normalizes errors via response interceptor.
2. **Product Service API (`client/src/api/productApi.js`):**
   - `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`.
3. **Product Form Component (`client/src/components/ProductForm.jsx`):**
   - Inputs for `name`, `price`, `category`, `stock`, `description`, `image_url`.
4. **Product Catalog (`client/src/components/ProductList.jsx`):**
   - Responsive cards with currency formatting, badges, stock counter, and image display with fallback.

---

## 9. Verification & Acceptance Criteria

1. **Database Schema:** Tables `User`, `Product`, `Order`, `Order_Product` exist in Turso Cloud database and can be verified via `sqlite_master`.
2. **Backend API:** All endpoints handle requests with parameterized queries, preventing SQL injection.
3. **Frontend UX:** Clean state transitions (loading spinner, error alert dismissal, optimistic delete/updates).
