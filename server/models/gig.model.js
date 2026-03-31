import mongoose from "mongoose";

const GigSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    title: { type: String, required: true },
    desc: { type: String, required: true },

    shortTitle: { type: String, required: true },
    shortDesc: { type: String, required: true },

    cat: { type: String, required: true },

    deliveryTime: { type: Number, required: true },
    revisionNumber: { type: Number, required: true },

    features: { type: [String] },

    price: { type: Number, required: true },

    cover: { type: String, required: true },
    images: { type: [String] },

    sales: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
    starNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Gig", GigSchema);
