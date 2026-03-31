//order route
import express from "express";

import { createPaymentIntent, confirmOrder, getOrders } from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Get all orders for current user
router.get("/", verifyToken, getOrders);

// Create payment intent for Stripe (and pending order)
router.post("/create-payment-intent/:id", verifyToken, createPaymentIntent);

// Confirm an order after payment success
router.put("/", verifyToken, confirmOrder);

export default router;
