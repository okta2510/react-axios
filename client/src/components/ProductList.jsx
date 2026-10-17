import React from "react";
import { Edit2, Trash2, Package, Tag, Layers, ShoppingCart } from "lucide-react";

export default function ProductList({
  products,
  onEdit,
  onDelete,
  onAddToCart,
  isLoading,
}) {
  if (isLoading && products.length === 0) {
    return (
      <div className="card loading-state">
        <div className="spinner"></div>
        <p>Loading products from Turso Database via Axios...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card empty-state">
        <Package size={40} className="empty-icon" />
        <h4>No products found in Turso DB</h4>
        <p>Use the form above to add your first product record!</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="item-list-container">
      <div className="list-header">
        <h3>Product Catalog ({products.length})</h3>
        <span className="badge badge-info">Turso `Product` Table</span>
      </div>

      <div className="items-grid">
        {products.map((product) => {
          const isOutOfStock = Number(product.stock) <= 0;
          return (
            <div key={product.id} className="item-card">
              <div className="item-main">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Package size={26} />
                  </div>
                )}

                <div className="item-details">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h4 className="item-title" style={{ margin: 0 }}>{product.name}</h4>
                    <span className="badge badge-primary">{formatPrice(product.price)}</span>
                    {product.category && (
                      <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>
                        <Tag size={10} style={{ marginRight: "2px" }} /> {product.category}
                      </span>
                    )}
                    {isOutOfStock ? (
                      <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        Out of Stock
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                        In Stock ({product.stock})
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="item-description" style={{ marginTop: "0.35rem" }}>
                      {product.description}
                    </p>
                  )}

                  <div className="item-meta" style={{ marginTop: "0.4rem" }}>
                    <Layers size={12} />
                    <span>ID #{product.id}</span>
                  </div>
                </div>
              </div>

              <div className="item-actions" style={{ flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                  style={{ width: "100%", justifyContent: "center" }}
                  title={isOutOfStock ? "Cannot add out of stock item" : "Add to shopping cart"}
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>

                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    type="button"
                    className="btn-icon btn-edit"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(product.id)}
                    title="Delete product"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
