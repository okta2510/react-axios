import axiosClient from "./axiosClient";

/**
 * Service functions for Order & Order_Product on /api/orders
 */

export const getOrders = async (userId) => {
  const url = userId ? `/orders?user_id=${userId}` : "/orders";
  const response = await axiosClient.get(url);
  return response.data;
};

export const createOrder = async ({ user_id, products }) => {
  const response = await axiosClient.post("/orders", { user_id, products });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axiosClient.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await axiosClient.delete(`/orders/${id}`);
  return response;
};

