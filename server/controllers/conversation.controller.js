import Conversation from "../models/conversation.model.js";

// Create conversation
export const createConversation = async (req, res, next) => {
  try {
    const sellerId = req.body.to;
    const buyerId = req.userId;

    // ── Self-messaging guard ───────────────────────────────────────
    if (sellerId === buyerId) {
      return res.status(403).json({ message: "You cannot message yourself." });
    }
    // ──────────────────────────────────────────────────────────────

    const existingConversation = await Conversation.findOne({
      $or: [
        { sellerId, buyerId },
        { sellerId: buyerId, buyerId: sellerId },
      ],
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = new Conversation({
      id: buyerId + sellerId,
      sellerId,
      buyerId,
    });
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    next(err);
  }
};

// Get single conversation
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get all conversations of a user
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ sellerId: req.userId }, { buyerId: req.userId }],
    }).sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Mark as read
export const updateConversation = async (req, res) => {
  try {
    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      { $set: { readBySeller: true, readByBuyer: true } },
      { new: true }
    );
    res.status(200).json(updatedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
};