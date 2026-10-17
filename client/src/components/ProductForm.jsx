import React, { useState, useEffect } from "react";
import { PlusCircle, Save, X } from "lucide-react";

export default function ProductForm({ onSubmit, editingProduct, onCancelEdit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "0",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price !== undefined ? String(editingProduct.price) : "",
        category: editingProduct.category || "",
        stock: editingProduct.stock !== undefined ? String(editingProduct.stock) : "0",
        description: editingProduct.description || "",
        image_url: editingProduct.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "0",
        description: "",
        image_url: "",
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") return;

    onSubmit({
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim() || "General",
      stock: parseInt(formData.stock, 10) || 0,
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
    });

    if (!editingProduct) {
      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "0",
        description: "",
        image_url: "",
      });
    }
  };

  return (
    <form className="item-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        {editingProduct && (
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. React & Node Course"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            autoFocus={!!editingProduct}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (USD / IDR) *</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="e.g. 49.99"
            value={formData.price}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="e.g. Courses, Electronics, Books"
            value={formData.category}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock Quantity</label>
          <input
            id="stock"
            name="stock"
            type="number"
            placeholder="e.g. 50"
            value={formData.stock}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="image_url">Image URL (optional)</label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={formData.image_url}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Detailed description of the product"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!formData.name.trim() || formData.price === "" || isSubmitting}
        >
          {editingProduct ? (
            <>
              <Save size={16} /> {isSubmitting ? "Updating..." : "Update Product"}
            </>
          ) : (
            <>
              <PlusCircle size={16} /> {isSubmitting ? "Saving..." : "Add Product"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

