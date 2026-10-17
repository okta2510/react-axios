import React, { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "./api/productApi";
import { getUsers, login, register } from "./api/authApi";
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from "./api/orderApi";

import AuthBar from "./components/AuthBar";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import CartModal from "./components/CartModal";
import OrderList from "./components/OrderList";
import StatusAlert from "./components/StatusAlert";

import { Package, ShoppingCart, ShoppingBag, PlusCircle, RefreshCw } from "lucide-react";

export default function App() {
  // Navigation tab: 'products', 'cart', 'orders'
  const [activeTab, setActiveTab] = useState("products");

  // Data states
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  // UI & Mutation states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    if (type === "success") {
      setTimeout(() => {
        setAlert({ type: "", message: "" });
      }, 4500);
    }
  };

  // --- Initial Data Fetching ---
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [fetchedProducts, fetchedUsers, fetchedOrders] = await Promise.all([
        getProducts(),
        getUsers(),
        getOrders(),
      ]);

      setProducts(fetchedProducts || []);
      setUsers(fetchedUsers || []);
      setOrders(fetchedOrders || []);

      // If no active user, select the first available user as default demo user
      if (!currentUser && fetchedUsers && fetchedUsers.length > 0) {
        setCurrentUser(fetchedUsers[0]);
      }
      setAlert({ type: "", message: "" });
    } catch (err) {
      console.error("Initialization error:", err);
      showAlert("error", err.message || "Failed to load data from Node server / Turso DB.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Auth Handlers ---
  const handleLogin = async (credentials) => {
    const user = await login(credentials);
    setCurrentUser(user);
    showAlert("success", `Welcome back, ${user.name}!`);
  };

  const handleRegister = async (userData) => {
    const newUser = await register(userData);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    showAlert("success", `Account created! Welcome, ${newUser.name}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showAlert("success", "Logged out. You are now browsing as Guest.");
  };

  const handleSelectUser = (userId) => {
    const found = users.find((u) => String(u.id) === String(userId));
    if (found) {
      setCurrentUser(found);
      showAlert("success", `Switched active user to: ${found.name} (${found.role})`);
    }
  };

  // --- Product CRUD Handlers ---
  const handleProductSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData);
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? updated : item))
        );
        showAlert("success", `Product "${updated.name}" updated successfully!`);
        setEditingProduct(null);
        setShowProductForm(false);
      } else {
        const newProduct = await createProduct(formData);
        setProducts((prev) => [newProduct, ...prev]);
        showAlert("success", `New product "${newProduct.name}" created on Turso DB!`);
        setShowProductForm(false);
      }
    } catch (err) {
      console.error("Product save failed:", err);
      showAlert("error", err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.id !== id));
      await deleteProduct(id);
      showAlert("success", "Product deleted successfully from Turso DB.");
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showAlert("error", err.message || "Failed to delete product.");
      fetchAllData();
    }
  };

  // --- Cart & Order Checkout Handlers ---
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showAlert("error", `Cannot add more. Available stock is ${product.stock}.`);
          return prev;
        }
        showAlert("success", `Added another "${product.name}" to cart.`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        showAlert("success", `"${product.name}" added to cart!`);
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      showAlert("error", "Please log in or select a user before placing an order.");
      return;
    }

    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderPayload = {
        user_id: currentUser.id,
        products: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const newOrder = await createOrder(orderPayload);

      // Decrement product stock in local state
      setProducts((prev) =>
        prev.map((prod) => {
          const cartItem = cart.find((c) => c.id === prod.id);
          if (cartItem) {
            return { ...prod, stock: Math.max(0, prod.stock - cartItem.quantity) };
          }
          return prod;
        })
      );

      // Add to orders list
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      showAlert("success", `🎉 Order #${newOrder.id} placed successfully for ${currentUser.name}!`);
      setActiveTab("orders"); // Switch to Orders tab so user sees their new order
    } catch (err) {
      console.error("Order checkout failed:", err);
      showAlert("error", err.message || "Failed to complete order.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // --- Order Status & Deletion Handlers ---
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      showAlert("success", `Order #${orderId} marked as ${status}.`);
    } catch (err) {
      showAlert("error", err.message || "Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}?`)) return;
    try {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      await deleteOrder(orderId);
      showAlert("success", `Order #${orderId} deleted successfully.`);
    } catch (err) {
      showAlert("error", err.message || "Failed to delete order.");
      fetchAllData();
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-badges">
          <span className="badge badge-primary">React + Axios</span>
          <span className="badge badge-node">Node.js Express API</span>
          <span className="badge badge-info">Turso LibSQL Database</span>
        </div>
        <h1>E-Commerce Store & Order System</h1>
        <p>Demonstrating Product CRUD, User Login, and Order Creation using React and Axios.</p>
      </header>

      {/* User Login & Switcher Bar */}
      <AuthBar
        currentUser={currentUser}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onSelectUser={handleSelectUser}
      />

      {/* Notification Banner */}
      {alert.message && (
        <StatusAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      )}

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <Package size={18} /> Products ({products.length})
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => setActiveTab("cart")}
        >
          <ShoppingCart size={18} /> Cart
          {cartTotalItems > 0 && <span className="tab-badge">{cartTotalItems}</span>}
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingBag size={18} /> My Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: Products (CRUD) */}
      {activeTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingProduct(null);
                setShowProductForm(!showProductForm);
              }}
            >
              <PlusCircle size={15} /> {showProductForm ? "Close Form" : "Add New Product"}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchAllData}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={isLoading ? "spin" : ""} /> Refresh
            </button>
          </div>

          {(showProductForm || editingProduct) && (
            <ProductForm
              onSubmit={handleProductSubmit}
              editingProduct={editingProduct}
              onCancelEdit={() => {
                setEditingProduct(null);
                setShowProductForm(false);
              }}
              isSubmitting={isSubmitting}
            />
          )}

          <ProductList
            products={products}
            onEdit={(product) => {
              setEditingProduct(product);
              setShowProductForm(true);
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
            onDelete={handleDeleteProduct}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* TAB 2: Shopping Cart & Do Order Checkout */}
      {activeTab === "cart" && (
        <CartModal
          cart={cart}
          currentUser={currentUser}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
        />
      )}

      {/* TAB 3: Order History */}
      {activeTab === "orders" && (
        <OrderList
          orders={orders}
          currentUser={currentUser}
          onUpdateStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
