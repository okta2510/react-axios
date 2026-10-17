import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

// --- Auth & User Endpoints ---
router.post("/auth/login", loginUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser); // Register user
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// --- Product Endpoints ---
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// --- Order Endpoints ---
router.get("/orders", getOrders);
router.post("/orders", createOrder); // Do Order
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

export default router;
