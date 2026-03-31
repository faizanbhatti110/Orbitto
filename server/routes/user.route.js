import express from "express";
import { getUser, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/:id", getUser);
router.put("/:id", verifyToken, updateUser);

export default router;