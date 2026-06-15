import { Types } from "mongoose";
import { propertyRepository, PropertyFilters } from "../repositories/property.repository.js";
import { AppError } from "../utils/AppError.js";
import { PropertyType } from "../models/Property.js";

export interface PropertyInput {
  title: string;
  description: string;
  price: number;
  location: { city: string; country: string };
  propertyType: PropertyType;
  imageUrls: string[];
}

function toPublicProperty(property: {
  _id: { toString(): string };
  title: string;
  description: string;
  price: number;
  location: { city: string; country: string };
  propertyType: PropertyType;
  imageUrls: string[];
  author: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  const author = property.author as {
    _id?: { toString(): string };
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };

  return {
    id: property._id.toString(),
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    propertyType: property.propertyType,
    imageUrls: property.imageUrls,
    author: author?._id
      ? {
          id: author._id.toString(),
          username: author.username,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl,
        }
      : property.author,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}

function getAuthorId(author: unknown): string {
  if (author instanceof Types.ObjectId) {
    return author.toString();
  }

  if (author && typeof author === "object" && "_id" in author) {
    const id = (author as { _id: Types.ObjectId })._id;
    return id instanceof Types.ObjectId ? id.toString() : String(id);
  }

  return String(author);
}

function assertOwner(propertyAuthorId: string, userId: string): void {
  if (propertyAuthorId !== userId) {
    throw new AppError("Forbidden: you are not the author of this property", 403);
  }
}

export const propertyService = {
  async list(filters: PropertyFilters) {
    const properties = await propertyRepository.findAll(filters);
    return properties.map(toPublicProperty);
  },

  async getById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new AppError("Property not found", 404);
    }
    return toPublicProperty(property);
  },

  async listByAuthor(authorId: string) {
    const properties = await propertyRepository.findByAuthor(authorId);
    return properties.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      price: p.price,
      location: p.location,
      propertyType: p.propertyType,
      imageUrls: p.imageUrls,
      author: authorId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  },

  async create(authorId: string, data: PropertyInput) {
    const property = await propertyRepository.create({
      ...data,
      author: new Types.ObjectId(authorId),
    });
    const populated = await propertyRepository.findById(property._id.toString());
    return toPublicProperty(populated!);
  },

  async update(id: string, userId: string, data: Partial<PropertyInput>) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404);
    }

    assertOwner(getAuthorId(existing.author), userId);

    const updated = await propertyRepository.update(id, data);
    return toPublicProperty(updated!);
  },

  async delete(id: string, userId: string) {
    const existing = await propertyRepository.findById(id);
    if (!existing) {
      throw new AppError("Property not found", 404);
    }

    assertOwner(getAuthorId(existing.author), userId);

    await propertyRepository.delete(id);
  },
};
