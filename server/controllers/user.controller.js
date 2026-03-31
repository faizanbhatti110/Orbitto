import User from "../models/user.model.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateUser = async (req, res) => {
  try {
    // Only allow updating safe fields — never password or isAdmin via this route
    const { password, isAdmin, ...allowedUpdates } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { returnDocument: "after" }
    ).select("-password");

    if (!updated) return res.status(404).json("User not found");

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};