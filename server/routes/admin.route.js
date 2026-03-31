import express from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllGigs,
    deleteGigAdmin,
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/jwt.js";

const router = express.Router();

// ─── Stats ─────────────────────────────────────────────────────────────────────
router.get("/stats", verifyAdmin, getStats);

// ─── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", verifyAdmin, getAllUsers);
router.get("/users/:id", verifyAdmin, getUserById);
router.put("/users/:id", verifyAdmin, updateUser);
router.delete("/users/:id", verifyAdmin, deleteUser);

// ─── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", verifyAdmin, getAllOrders);
router.get("/orders/:id", verifyAdmin, getOrderById);
router.put("/orders/:id", verifyAdmin, updateOrderStatus);

// ─── Gigs — view & delete only, no edit ────────────────────────────────────────
router.get("/gigs", verifyAdmin, getAllGigs);
router.delete("/gigs/:id", verifyAdmin, deleteGigAdmin);

export default router;