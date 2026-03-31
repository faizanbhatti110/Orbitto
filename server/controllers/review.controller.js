import Review from "../models/review.model.js";
import Gig from "../models/gig.model.js";

// GET Reviews of a Gig
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CREATE Review
export const createReview = async (req, res) => {
  try {
    // ── Self-review guard ──────────────────────────────────────────
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found." });

    if (gig.userId.toString() === req.userId) {
      return res.status(403).json({ message: "You cannot review your own gig." });
    }
    // ──────────────────────────────────────────────────────────────

    const newReview = new Review(req.body);
    const savedReview = await newReview.save();

    await Gig.findByIdAndUpdate(req.body.gigId, {
      $inc: { totalStars: req.body.star, starNumber: 1 },
    });

    res.status(201).json(savedReview);
  } catch (err) {
    res.status(500).json(err);
  }
};