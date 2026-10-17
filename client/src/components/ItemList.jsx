import React from "react";
import { Check, Edit2, Trash2, Calendar, Database } from "lucide-react";

export default function ItemList({
  items,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading,
}) {
  if (isLoading && items.length === 0) {
    return (
      <div className="card loading-state">
        <div className="spinner"></div>
        <p>Loading items from Turso Database via Axios...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card empty-state">
        <Database size={40} className="empty-icon" />
        <h4>No items found in Turso DB</h4>
        <p>Use the form above to add your first record!</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? dateStr : date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="item-list-container">
      <div className="list-header">
        <h3>Items Collection ({items.length})</h3>
        <span className="badge badge-info">Turso LibSQL</span>
      </div>

      <div className="items-grid">
        {items.map((item) => {
          const isDone = Boolean(item.completed);
          return (
            <div key={item.id} className={`item-card ${isDone ? "is-completed" : ""}`}>
              <div className="item-main">
                <button
                  type="button"
                  className={`toggle-check ${isDone ? "checked" : ""}`}
                  onClick={() => onToggleComplete(item.id, !isDone)}
                  title={isDone ? "Mark as pending" : "Mark as completed"}
                >
                  {isDone && <Check size={14} />}
                </button>

                <div className="item-details">
                  <h4 className="item-title">{item.title}</h4>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <div className="item-meta">
                    <Calendar size={12} />
                    <span>ID #{item.id} &bull; {formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="item-actions">
                <button
                  type="button"
                  className="btn-icon btn-edit"
                  onClick={() => onEdit(item)}
                  title="Edit item"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-icon btn-delete"
                  onClick={() => onDelete(item.id)}
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

