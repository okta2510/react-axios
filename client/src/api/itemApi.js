import axiosClient from "./axiosClient";

/**
 * Service functions for CRUD operations on /api/items
 */

export const getItems = async () => {
  const response = await axiosClient.get("/items");
  return response.data; // Array of items
};

export const getItemById = async (id) => {
  const response = await axiosClient.get(`/items/${id}`);
  return response.data;
};

export const createItem = async ({ title, description }) => {
  const response = await axiosClient.post("/items", { title, description });
  return response.data;
};

export const updateItem = async (id, updates) => {
  const response = await axiosClient.put(`/items/${id}`, updates);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await axiosClient.delete(`/items/${id}`);
  return response;
};

