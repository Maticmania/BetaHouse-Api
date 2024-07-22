import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    toilets: {
      type: Number,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],
    category: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    propertyRef: {
      type: String,
      required: true,
      unique: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
