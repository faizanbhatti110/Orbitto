import Gig from "../models/gig.model.js";

export const createGig = async (req, res) => {
  try {
    const newGig = new Gig(req.body);
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getGigs = async (req, res) => {
  try {
    const { cat, min, max, sort, search, page = 1, limit = 12, userId } = req.query;
    const filters = {
      ...(cat && { cat }),
      ...(userId && { userId }),
      ...(search && { title: { $regex: search, $options: "i" } }),
      price: {
        $gt: Number(min) || 0,
        $lt: Number(max) || 100000,
      },
    };
    const sortField = sort || "createdAt";
    const gigs = await Gig.find(filters)
      .sort({ [sortField]: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Gig.countDocuments(filters);
    res.status(200).json({ gigs, total });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json("Gig not found");
    res.status(200).json(gig);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteGig = async (req, res) => {
  try {
    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).json("Gig deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

// ── UPDATE GIG (everything except category) ──
export const updateGig = async (req, res) => {
  try {
    const { cat, ...allowedUpdates } = req.body; // strip cat — category is locked
    const updated = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { returnDocument: "after" }
    );
    if (!updated) return res.status(404).json("Gig not found");
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};