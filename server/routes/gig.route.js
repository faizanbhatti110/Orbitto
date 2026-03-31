import express from "express";
import {
  createGig,
  getGig,
  getGigs,
  deleteGig,
  updateGig,
} from "../controllers/gig.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createGig);
router.get("/", getGigs);
router.get("/single/:id", getGig);
router.delete("/:id", verifyToken, deleteGig);
router.put("/:id", verifyToken, updateGig);   // ← new

export default router;