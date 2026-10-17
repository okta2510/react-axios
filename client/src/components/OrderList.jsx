import React from "react";
import { Package, Calendar, User, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";

export default function OrderList({
  orders,
  currentUser,
  onUpdateStatus,
  onDeleteOrder,
  isLoading,
}) {
  if (isLoading && orders.length === 0) {
    return (
      <div className="card loading-state">
        <div className="spinner"></div>
        <p>Loading orders from Turso Database via Axios...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card empty-state">
        <Package size={40} className="empty-icon" />
        <h4>No Orders Found</h4>
        <p>
          {currentUser
            ? `No orders placed yet for ${currentUser.name}. Browse products and place an order!`
            : "No orders found in the database. Log in and place your first order!"}
        </p>
      </div>
    );
  }

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="badge" style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}>
            <CheckCircle size={10} style={{ marginRight: "3px" }} /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="badge" style={{ backgroundColor: "#fef2f2", color: "#991b1b" }}>
            <XCircle size={10} style={{ marginRight: "3px" }} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="badge" style={{ backgroundColor: "#fffbeb", color: "#92400e" }}>
            <Clock size={10} style={{ marginRight: "3px" }} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="item-list-container">
      <div className="list-header">
        <h3>Order History ({orders.length})</h3>
        <span className="badge badge-info">Turso `Order` & `Order_Product`</span>
      </div>

      <div className="items-grid">
        {orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: "1.25rem", margin: 0 }}>
            {/* Header info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "0.75rem",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0 }}>Order #{order.id}</h4>
                  {getStatusBadge(order.status)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "flex", gap: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar size={12} /> {formatDate(order.created_at)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <User size={12} /> {order.user_name || `User #${order.user_id}`} ({order.user_email || ""})
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Total Amount</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>

            {/* Line Items from Order_Product */}
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Items Purchased:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {order.products && order.products.length > 0 ? (
                  order.products.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        padding: "0.35rem 0.6rem",
                        backgroundColor: "#f8fafc",
                        borderRadius: "6px",
                      }}
                    >
                      <span>
                        {p.product_name || `Product #${p.product_id}`} &times; {p.quantity}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatPrice(Number(p.unit_price) * Number(p.quantity))}
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No item details</span>
                )}
              </div>
            </div>

            {/* Order Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {order.status !== "completed" && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onUpdateStatus(order.id, "completed")}
                  >
                    Mark Completed
                  </button>
                )}
                {order.status !== "cancelled" && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onUpdateStatus(order.id, "cancelled")}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn-icon btn-delete"
                onClick={() => onDeleteOrder(order.id)}
                title="Delete order record"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

