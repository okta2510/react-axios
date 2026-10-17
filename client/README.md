# React + Axios Frontend Client

A modern Single Page Application (SPA) built with **React** and **Vite**, demonstrating production patterns for HTTP communication using **Axios**. The frontend connects to the Express API server and interacts with the Turso SQLite database based on `schema.md`.

---

## 🛠️ Tech Stack & Libraries

- **Framework:** React 18 (with Vite)
- **HTTP Client:** **Axios** (Centralized instance, request/response interceptors)
- **Icons:** `lucide-react`
- **Styling:** Modern responsive CSS with custom properties (CSS variables)

---

## 📁 Directory Structure

```text
client/
├── README.md               # Frontend documentation and usage guide
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Vite configuration (port 5173)
├── index.html              # HTML shell with Google Fonts
├── .env.example            # Environment variables template
├── .env                    # Active environment variables (git-ignored)
├── .gitignore              # Ignores node_modules, dist, .env
└── src/
    ├── api/
    │   ├── axiosClient.js  # Centralized Axios instance with interceptors
    │   ├── productApi.js   # Service calls for /api/products
    │   ├── authApi.js      # Service calls for /api/auth and /api/users
    │   └── orderApi.js     # Service calls for /api/orders
    ├── components/
    │   ├── AuthBar.jsx     # User login, registration, and demo user switcher
    │   ├── ProductForm.jsx # Create and edit product form
    │   ├── ProductList.jsx # Product catalog grid with stock and cart actions
    │   ├── CartModal.jsx   # Shopping cart and order checkout view
    │   ├── OrderList.jsx   # Order history view with line item breakdowns
    │   └── StatusAlert.jsx # Feedback alerts for success and error messages
    ├── App.jsx             # Main container assembling state, navigation, and tabs
    ├── main.jsx            # React root DOM entry
    └── index.css           # Global stylesheet and responsive styles
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `client/` directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to the running backend Express server (Port 5001):

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:5173`**.

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 💡 Key Architectural Concepts & Axios Patterns

### 1. Centralized Axios Instance (`src/api/axiosClient.js`)
Instead of importing `axios` directly in every component, a single configured client is exported:

```javascript
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10-second request timeout
});

// Response Interceptor: unwrap payload & normalize errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Network error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
```

### 2. Modular API Service Layer
Components never write raw HTTP endpoints. They call semantic methods:
- `productApi.js`: `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`
- `authApi.js`: `login()`, `register()`, `getUsers()`
- `orderApi.js`: `getOrders()`, `createOrder()`, `updateOrderStatus()`, `deleteOrder()`

### 3. State Management & Navigation Tabs
`App.jsx` coordinates 3 primary user views:
- **🛍️ Products Tab:**
  - View all products fetched from Turso DB.
  - Filter by in-stock status.
  - Full CRUD: Add new products, edit existing items, and delete items.
  - "Add to Cart" with stock limit protection.
- **🛒 Shopping Cart Tab:**
  - Adjust item quantities (`+` / `-`).
  - Realtime total price calculation.
  - Checkout / Do Order action linked to the active user (`user_id`).
- **📦 My Orders Tab:**
  - Displays submitted orders.
  - Lists itemized line items from `Order_Product` (unit price, quantity, total).
  - Order status updates (Mark Completed / Cancel).

### 4. User Authentication & Demo Switcher (`AuthBar.jsx`)
- Supports logging in via email & password.
- Supports registering new user accounts.
- Features a **Quick User Switcher** dropdown for effortless classroom or testing demonstrations across multiple user roles (Customer / Admin).

---

## 🎨 UI & UX Highlights

- **Optimistic Updates:** Immediate feedback when adjusting cart quantities or deleting records.
- **Stock Guardrails:** Prevents adding out-of-stock products to cart or ordering more than available inventory.
- **Loading Indicators:** Spinners during asynchronous network requests.
- **Error Banners:** Clear, dismissible notifications if the server or Turso connection fails.

