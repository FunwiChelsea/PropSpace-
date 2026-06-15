import mongoose, { Document, Schema, Types } from "mongoose";

export type PropertyType = "Apartment" | "House" | "Studio";

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    country: string;
  };
  propertyType: PropertyType;
  imageUrls: string[];
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: {
      city: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    propertyType: {
      type: String,
      enum: ["Apartment", "House", "Studio"],
      required: true,
    },
    imageUrls: [{ type: String, required: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

propertySchema.index({ "location.city": 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ author: 1 });

export const Property = mongoose.model<IProperty>("Property", propertySchema);
