# Product Requirements Document (PRD)
## Simple React + Axios with Node.js API & Turso Database

---

## 1. Executive Summary & Objective

### 1.1 Overview
This project is a lightweight, full-stack web application designed to demonstrate seamless end-to-end data flow using:
- **Frontend:** React with **Axios** for clean, modular HTTP communication.
- **Backend:** Node.js with Express providing a RESTful API layer.
- **Database:** **Turso** (distributed SQLite powered by LibSQL) accessed using official SDK (`@libsql/client`).
- **Configuration:** Strictly isolated configuration via environment variables (`.env`).

### 1.2 Purpose & Scope
The application serves as a standard reference and learning module (e.g., for Dumet School students/developers) showing how to:
1. Configure an Axios API client with base URLs and interceptors in React.
2. Build REST API endpoints with Express and Node.js.
3. Connect securely to a Turso Cloud / local LibSQL database using credentials from environment variables (`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`).
4. Perform complete CRUD operations (Create, Read, Update, Delete) with state management, loading, and error states on the frontend.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Key Dependencies / Tools | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite / React 18+) | `axios`, `lucide-react` (icons) | User Interface, Client-side state & API queries |
| **Backend** | Node.js | `express`, `cors`, `dotenv`, `@libsql/client` | REST API routes, business logic, Turso client |
| **Database** | Turso (LibSQL) | Cloud Database / CLI | Serverless SQLite database at the edge |
| **Environment** | `.env` | `dotenv` (server), `VITE_API_URL` (client) | Secure configuration & secrets management |

---

## 3. System Architecture & Data Flow

```mermaid
flowchart LR
    subgraph Client ["Client (React App)"]
        UI["React Components"]
        Axios["Axios API Client<br/>(baseURL, headers)"]
        UI -->|Calls API Service| Axios
    end

    subgraph Server ["Node.js API Server (Express)"]
        Router["Express Router (/api)"]
        Controller["Route Controllers"]
        LibSQL["@libsql/client<br/>(url, authToken from .env)"]
        Axios -->|HTTP Request (JSON)| Router
        Router --> Controller
        Controller --> LibSQL
    end

    subgraph Database ["Turso (LibSQL Cloud)"]
        TursoDB[("SQLite Database<br/>(e.g., items table)")]
        LibSQL -->|libsql:// protocol| TursoDB
    end

    TursoDB -->|Result Rows| LibSQL
    LibSQL --> Controller
    Controller -->|JSON Response| Router
    Router -->|HTTP Response 200/201/400/500| Axios
    Axios -->|Updated State| UI
```

---

## 4. Environment Variables Configuration

### 4.1 Server (`server/.env`)
All Turso credentials and server configurations must be stored in the root server `.env` file and omitted from version control (`.gitignore`).

```env
# Server Port (5001 used to avoid macOS AirPlay conflict on 5000)
PORT=5001

# Turso Database Credentials
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-jwt-auth-token

# Client Origin (CORS whitelist)
CLIENT_URL=http://localhost:5173
```

### 4.2 Client (`client/.env`)
```env
# Base URL pointing to the Node.js Express server
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 5. Database Schema & Data Model

We will implement a standard, easy-to-understand **Items / Tasks** entity suitable for learning and production patterns.

### 5.1 Table: `items`
```sql
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 JSON Representation
```json
{
  "id": 1,
  "title": "Learn React and Axios",
  "description": "Understand how to fetch data from Express and Turso",
  "completed": false,
  "created_at": "2026-10-17 08:00:00"
}
```

---

## 6. REST API Specification

**Base URL:** `http://localhost:5001/api`

| Method | Endpoint | Description | Request Body | Response (Success) | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/items` | Fetch all items | None | `{ success: true, data: Item[] }` | `200 OK` |
| `GET` | `/items/:id` | Fetch item by ID | None | `{ success: true, data: Item }` | `200 OK` / `404 Not Found` |
| `POST` | `/items` | Create new item | `{ title: string, description?: string }` | `{ success: true, data: Item }` | `201 Created` |
| `PUT` | `/items/:id` | Update item details / status | `{ title?: string, description?: string, completed?: boolean }` | `{ success: true, data: Item }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/items/:id` | Delete an item | None | `{ success: true, message: "Item deleted successfully" }` | `200 OK` / `404 Not Found` |

### 6.1 Standard Error Format
```json
{
  "success": false,
  "error": "Error description message"
}
```

---

## 7. Project Directory Structure

```text
react-axios/
├── prd.md                     # Product Requirements Document
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Environment variables (TURSO_*, PORT)
│   ├── .env.example           # Example template
│   ├── .gitignore
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Turso client initialization (@libsql/client)
│   │   ├── controllers/
│   │   │   └── itemController.js # CRUD controller handlers
│   │   ├── routes/
│   │   │   └── itemRoutes.js  # Express router endpoints
│   │   └── index.js           # Server entry point & CORS configuration
└── client/                    # React Frontend (Vite)
    ├── .env                   # Client environment variables (VITE_API_BASE_URL)
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   ├── axiosClient.js # Centralized Axios instance configuration
        │   └── itemApi.js     # Typed / Modular API calls (CRUD)
        ├── components/
        │   ├── ItemForm.jsx   # Form component to create/edit items
        │   ├── ItemList.jsx   # List rendering with complete/delete actions
        │   └── StatusAlert.jsx# Loading / Error indicator banners
        ├── App.jsx            # Main view assembling components & state
        └── main.jsx           # React DOM root entry
```

---

## 8. Technical Implementation Details

### 8.1 Backend (Node.js + Turso)
1. **Turso Client (`server/src/config/db.js`):**
   ```javascript
   import { createClient } from "@libsql/client";
   import dotenv from "dotenv";

   dotenv.config();

   if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
     throw new Error("Missing Turso database credentials in .env file");
   }

   export const db = createClient({
     url: process.env.TURSO_DATABASE_URL,
     authToken: process.env.TURSO_AUTH_TOKEN,
   });
   ```

2. **Schema Bootstrap (`initDb`):**
   Auto-create the `items` table on server startup if it does not already exist.

3. **CORS & JSON Middleware (`server/src/index.js`):**
   Enable `cors({ origin: process.env.CLIENT_URL || '*' })` and `express.json()`.

### 8.2 Frontend (React + Axios)
1. **Axios Central Client (`client/src/api/axiosClient.js`):**
   ```javascript
   import axios from "axios";

   const axiosClient = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
     headers: {
       "Content-Type": "application/json",
     },
     timeout: 10000,
   });

   // Global response error interceptor for consistent error messaging
   axiosClient.interceptors.response.use(
     (response) => response.data,
     (error) => {
       const message = error.response?.data?.error || error.message || "Network Error";
       return Promise.reject(new Error(message));
     }
   );

   export default axiosClient;
   ```

2. **API Service Layer (`client/src/api/itemApi.js`):**
   - `getItems()`: `GET /items`
   - `createItem(payload)`: `POST /items`
   - `updateItem(id, payload)`: `PUT /items/:id`
   - `deleteItem(id)`: `DELETE /items/:id`

3. **User Experience & Feedback:**
   - Loading spinners during asynchronous Axios calls.
   - Inline feedback for network / database connection failures.
   - Optimistic UI updates or refetch on mutation.

---

## 9. Non-Functional Requirements (NFR)

1. **Security:**
   - Zero hardcoded tokens or URLs.
   - SQL parameterization via `@libsql/client` query placeholders (`args: [title, ...]`) to prevent SQL injection.
2. **Reliability & Error Handling:**
   - Graceful fallback and user-friendly error messages if Turso is unreachable or credentials are invalid.
3. **Performance:**
   - Turso edge replication provides sub-10ms reads globally.
   - Axios timeout configured at 10 seconds to avoid hung UI requests.
4. **Developer Experience (DX):**
   - Simple `npm run dev` scripts for both client and server.
   - Clear `.env.example` provided for both folders.

---

## 10. Execution & Milestones

1. **Milestone 1: Environment & Turso Setup**
   - Create Turso database using `turso db create react-axios-db`.
   - Obtain database URL and auth token using `turso db show --url` and `turso db tokens create`.
   - Setup `server/.env`.
2. **Milestone 2: Node.js Express Server & Turso Integration**
   - Initialize Node project and install `@libsql/client`, `express`, `cors`, `dotenv`.
   - Implement `db.js`, routes, and controllers with table auto-initialization.
   - Test endpoints via curl or Postman.
3. **Milestone 3: React Frontend Setup with Axios**
   - Initialize Vite React template.
   - Install `axios` and setup `axiosClient.js`.
   - Build UI components (`ItemForm`, `ItemList`) with full CRUD and state management.
4. **Milestone 4: Verification & End-to-End Validation**
   - Run both services concurrently.
   - Verify create, read, toggle status, and delete operations reflect in Turso.

