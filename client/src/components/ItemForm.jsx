import React, { useState, useEffect } from "react";
import { PlusCircle, Save, X } from "lucide-react";

export default function ItemForm({ onSubmit, editingItem, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setDescription(editingItem.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
    });

    if (!editingItem) {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form className="item-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{editingItem ? "Edit Item" : "Create New Item"}</h3>
        {editingItem && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Set up Turso database"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
          autoFocus={!!editingItem}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          placeholder="e.g. Configure TURSO_DATABASE_URL and auth token"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!title.trim() || isSubmitting}
        >
          {editingItem ? (
            <>
              <Save size={16} /> {isSubmitting ? "Updating..." : "Update Item"}
            </>
          ) : (
            <>
              <PlusCircle size={16} /> {isSubmitting ? "Adding..." : "Add Item"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

