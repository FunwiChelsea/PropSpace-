import { FilterQuery } from "mongoose";
import { Property, IProperty } from "../models/Property.js";

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

function buildFilter(filters: PropertyFilters): FilterQuery<IProperty> {
  const query: FilterQuery<IProperty> = {};

  if (filters.city) {
    query["location.city"] = { $regex: filters.city, $options: "i" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }

  return query;
}

export const propertyRepository = {
  async findAll(filters: PropertyFilters = {}): Promise<IProperty[]> {
    return Property.find(buildFilter(filters))
      .populate("author", "username displayName avatarUrl")
      .sort({ createdAt: -1 });
  },

  async findById(id: string): Promise<IProperty | null> {
    return Property.findById(id).populate("author", "username displayName avatarUrl");
  },

  async findByAuthor(authorId: string): Promise<IProperty[]> {
    return Property.find({ author: authorId }).sort({ createdAt: -1 });
  },

  async create(data: Partial<IProperty>): Promise<IProperty> {
    return Property.create(data);
  },

  async update(id: string, data: Partial<IProperty>): Promise<IProperty | null> {
    return Property.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      "author",
      "username displayName avatarUrl"
    );
  },

  async delete(id: string): Promise<IProperty | null> {
    return Property.findByIdAndDelete(id);
  },
};
