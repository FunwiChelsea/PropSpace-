export type PropertyType = "Apartment" | "House" | "Studio";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyAuthor {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    country: string;
  };
  propertyType: PropertyType;
  imageUrls: string[];
  author: PropertyAuthor | string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PropertyInput {
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    country: string;
  };
  propertyType: PropertyType;
  imageUrls: string[];
}
