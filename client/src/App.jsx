import React, { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "./api/itemApi";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import StatusAlert from "./components/StatusAlert";
import { Layers, Database, RefreshCw } from "lucide-react";

export default function App() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    if (type === "success") {
      setTimeout(() => {
        setAlert({ type: "", message: "" });
      }, 4000);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getItems();
      setItems(data || []);
      setAlert({ type: "", message: "" });
    } catch (err) {
      console.error("Failed to fetch items:", err);
      showAlert("error", err.message || "Failed to connect to the Node.js API / Turso DB.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updated = await updateItem(editingItem.id, formData);
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updated : item))
        );
        showAlert("success", "Item updated successfully!");
        setEditingItem(null);
      } else {
        const newItem = await createItem(formData);
        setItems((prev) => [newItem, ...prev]);
        showAlert("success", "New item added successfully to Turso DB!");
      }
    } catch (err) {
      console.error("Mutation failed:", err);
      showAlert("error", err.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      // Optimistic UI update
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, completed: completed ? 1 : 0 } : item))
      );
      await updateItem(id, { completed });
    } catch (err) {
      console.error("Toggle complete failed:", err);
      showAlert("error", "Failed to update item status.");
      // Rollback on error
      fetchItems();
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      // Optimistic UI update
      setItems((prev) => prev.filter((item) => item.id !== id));
      await deleteItem(id);
      showAlert("success", "Item deleted successfully.");
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showAlert("error", err.message || "Failed to delete item.");
      fetchItems();
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-badges">
          <span className="badge badge-primary">React + Axios</span>
          <span className="badge badge-node">Node.js Express</span>
          <span className="badge badge-info">Turso Database</span>
        </div>
        <h1>Full-Stack Item Manager</h1>
        <p>Simple demonstration of React fetching & mutating Turso LibSQL via Axios.</p>
      </header>

      {alert.message && (
        <StatusAlert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      )}

      <ItemForm
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        onCancelEdit={() => setEditingItem(null)}
        isSubmitting={isSubmitting}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchItems}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? "spin" : ""} /> Refresh Data
        </button>
      </div>

      <ItemList
        items={items}
        onToggleComplete={handleToggleComplete}
        onEdit={(item) => setEditingItem(item)}
        onDelete={handleDeleteItem}
        isLoading={isLoading}
      />
    </div>
  );
}

