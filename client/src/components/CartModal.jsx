import React from "react";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function CartModal({
  cart,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isCheckingOut,
}) {
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  if (cart.length === 0) {
    return (
      <div className="card empty-state">
        <ShoppingCart size={40} className="empty-icon" />
        <h4>Your Shopping Cart is Empty</h4>
        <p>Explore the Product Catalog and click "Add to Cart" to start an order!</p>
      </div>
    );
  }

  return (
    <div className="card cart-card">
      <div className="list-header">
        <h3>Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onClearCart}
          disabled={isCheckingOut}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "0.95rem" }}>{item.name}</strong>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {formatPrice(item.price)} each &bull; Stock: {item.stock}
              </div>
            </div>

            {/* Quantity Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || isCheckingOut}
                title="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span style={{ fontWeight: 600, minWidth: "24px", textAlign: "center" }}>
                {item.quantity}
              </span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock || isCheckingOut}
                title={item.quantity >= item.stock ? "Max stock reached" : "Increase quantity"}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Subtotal */}
            <div style={{ minWidth: "80px", textAlign: "right", fontWeight: 600 }}>
              {formatPrice(item.price * item.quantity)}
            </div>

            {/* Remove */}
            <button
              type="button"
              className="btn-icon btn-delete"
              onClick={() => onRemoveItem(item.id)}
              disabled={isCheckingOut}
              title="Remove item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Total Order Price:</span>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--primary)" }}>
            {formatPrice(totalPrice)}
          </span>
        </div>

        {!currentUser ? (
          <div className="alert-banner alert-error" style={{ margin: 0 }}>
            <div className="alert-content">
              <AlertCircle size={18} />
              <span>You must be logged in to complete this order. Please log in or switch user in the top bar.</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem" }}
            onClick={onCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              "Processing Order via Turso DB..."
            ) : (
              <>
                Confirm & Place Order ({currentUser.name}) <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

