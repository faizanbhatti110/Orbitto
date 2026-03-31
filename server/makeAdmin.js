/**
 * makeAdmin.js — One-time script to set a user as admin in MongoDB.
 *
 * Usage:
 *   node makeAdmin.js <username>
 *
 * Example:
 *   node makeAdmin.js john123
 */

import "dotenv/config.js";
import mongoose from "mongoose";
import User from "./models/user.model.js";

const username = process.argv[2];

if (!username) {
    console.error("❌  Usage: node makeAdmin.js <username>");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGODB_URL)
    .then(async () => {
        const user = await User.findOneAndUpdate(
            { username },
            { $set: { isAdmin: true } },
            { new: true }
        );

        if (!user) {
            console.error(`❌  No user found with username: "${username}"`);
        } else {
            console.log(`✅  "${user.username}" (${user.email}) is now an Admin!`);
        }

        await mongoose.disconnect();
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌  DB connection failed:", err.message);
        process.exit(1);
    });
