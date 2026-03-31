import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    gigId: { type: String, required: true },
    img: { type: String },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    sellerId: { type: String, required: true },
    buyerId: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    paymentIntent: { type: String }, // Stripe payment intent ID
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
