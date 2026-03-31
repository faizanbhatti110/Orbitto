import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { id: gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found." });

    // ── Self-payment guard ─────────────────────────────────────────
    if (gig.userId.toString() === req.userId) {
      return res.status(403).json({ message: "You cannot purchase your own gig." });
    }
    // ──────────────────────────────────────────────────────────────

    // Check for an existing INCOMPLETE order for this buyer+gig
    const existingOrder = await Order.findOne({
      gigId: gig._id.toString(),
      buyerId: req.userId,
      isCompleted: false,
    });

    if (existingOrder && existingOrder.paymentIntent) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          existingOrder.paymentIntent
        );
        if (
          existingIntent.status === "requires_payment_method" ||
          existingIntent.status === "requires_confirmation" ||
          existingIntent.status === "requires_action"
        ) {
          return res.status(200).json({ clientSecret: existingIntent.client_secret });
        }
        if (existingIntent.status === "succeeded") {
          await Order.findByIdAndUpdate(existingOrder._id, { $set: { isCompleted: true } });
        }
      } catch (stripeErr) {
        console.log("Could not retrieve existing intent, creating new one.", stripeErr.message);
      }
    }

    const amount = gig.price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      paymentIntent: paymentIntent.id,
    });
    await newOrder.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const existing = await Order.findOne({ paymentIntent: req.body.payment_intent });
    if (!existing) return res.status(404).json("Order not found");
    if (existing.isCompleted) return res.status(200).send("Order already confirmed.");

    await Order.findByIdAndUpdate(
      existing._id,
      { $set: { isCompleted: true } },
      { returnDocument: "after" }
    );

    // ── Increment gig sales counter ────────────────────────────────
    await Gig.findByIdAndUpdate(existing.gigId, { $inc: { sales: 1 } });
    // ──────────────────────────────────────────────────────────────

    res.status(200).send("Order has been confirmed.");
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
      isCompleted: true,
    });
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};