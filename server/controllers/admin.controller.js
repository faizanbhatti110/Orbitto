import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import mongoose from "mongoose";

// GET all users (exclude password)
export const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};

        // role filter: "faculty" or "student"
        if (role === "faculty") filter.role = "faculty";
        else if (role === "student") filter.role = "student";

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET single user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT update user
export const updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { returnDocument: "after", runValidators: true }
        ).select("-password");
        if (!updated) return res.status(404).json({ message: "User not found" });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE user
export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET admin stats summary
export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFreelancers = await User.countDocuments({ isSeller: true });
        const totalFaculty = await User.countDocuments({ role: "faculty" });
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalGigs = await Gig.countDocuments();
        res.status(200).json({
            totalUsers,
            totalSellers: totalFreelancers,  // keep key name so frontend stat card still works
            totalBuyers: totalStudents,      // keep key name so frontend stat card still works
            totalFaculty,
            totalGigs,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── ORDER MANAGEMENT ─────────────────────────────────────────────────────────

const toObjectIds = (ids) =>
    ids
        .filter(Boolean)
        .map((id) => {
            try { return new mongoose.Types.ObjectId(id); }
            catch { return null; }
        })
        .filter(Boolean);

// GET all orders (admin view)
export const getAllOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status === "completed") filter.isCompleted = true;
        else if (status === "pending") filter.isCompleted = false;

        let orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

        const rawBuyerIds = orders.map((o) => o.buyerId);
        const rawSellerIds = orders.map((o) => o.sellerId);
        const objectIds = toObjectIds([...new Set([...rawBuyerIds, ...rawSellerIds])]);

        const users = await User.find({ _id: { $in: objectIds } })
            .select("_id username email img country")
            .lean();

        const userMap = {};
        users.forEach((u) => { userMap[u._id.toString()] = u; });

        orders = orders.map((o) => ({
            ...o,
            buyerId: userMap[o.buyerId?.toString()] || { username: o.buyerId },
            sellerId: userMap[o.sellerId?.toString()] || { username: o.sellerId },
        }));

        if (search) {
            const q = search.toLowerCase();
            orders = orders.filter((o) =>
                o.buyerId?.username?.toLowerCase().includes(q) ||
                o.sellerId?.username?.toLowerCase().includes(q) ||
                o.title?.toLowerCase().includes(q) ||
                o._id?.toString().toLowerCase().includes(q)
            );
        }

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET single order by ID (admin)
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ message: "Order not found" });

        const buyerObjId = toObjectIds([order.buyerId])[0];
        const sellerObjId = toObjectIds([order.sellerId])[0];

        const [buyer, seller] = await Promise.all([
            buyerObjId ? User.findById(buyerObjId).select("_id username email img country").lean() : null,
            sellerObjId ? User.findById(sellerObjId).select("_id username email img country").lean() : null,
        ]);

        res.status(200).json({
            ...order,
            buyerId: buyer || { username: order.buyerId },
            sellerId: seller || { username: order.sellerId },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { isCompleted } = req.body;
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { isCompleted } },
            { returnDocument: "after" }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GIG MANAGEMENT ───────────────────────────────────────────────────────────

export const getAllGigs = async (req, res) => {
    try {
        const { search, cat } = req.query;
        const filters = {};
        if (cat && cat !== "all") filters.cat = cat;

        let gigs = await Gig.find(filters).sort({ createdAt: -1 }).lean();

        const rawUserIds = gigs.map((g) => g.userId);
        const objectIds = toObjectIds([...new Set(rawUserIds)]);

        const users = await User.find({ _id: { $in: objectIds } })
            .select("_id username email img isSeller isAdmin role")  // role included
            .lean();

        const userMap = {};
        users.forEach((u) => { userMap[u._id.toString()] = u; });

        gigs = gigs.map((g) => ({
            ...g,
            userId: userMap[g.userId?.toString()] || { username: g.userId },
        }));

        if (search) {
            const q = search.toLowerCase();
            gigs = gigs.filter((g) =>
                g.title?.toLowerCase().includes(q) ||
                g.userId?.username?.toLowerCase().includes(q) ||
                g._id?.toString().toLowerCase().includes(q)
            );
        }

        res.status(200).json(gigs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE gig (admin)
export const deleteGigAdmin = async (req, res) => {
    try {
        const deleted = await Gig.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Gig not found" });
        res.status(200).json({ message: "Gig deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};