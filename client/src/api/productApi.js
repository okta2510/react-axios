import axiosClient from "./axiosClient";

/**
 * Service functions for Product CRUD operations on /api/products
 * Based on schema.md:
 * - name (text NOT NULL)
 * - price (real NOT NULL)
 * - category (text)
 * - stock (integer DEFAULT 0)
 * - description (text)
 * - image_url (text)
 */

export const getProducts = async () => {
  const response = await axiosClient.get("/products");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosClient.post("/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosClient.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response;
};

