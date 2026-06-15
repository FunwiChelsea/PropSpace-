import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/AppError.js";
import { AuthPayload } from "../middleware/auth.middleware.js";

const SALT_ROUNDS = 10;

function toPublicUser(user: {
  _id: { toString(): string };
  email: string;
  username: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export const authService = {
  async register(data: { email: string; username: string; password: string }) {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError("Email already in use", 400);
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new AppError("Username already in use", 400);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
      displayName: data.username,
    });

    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    return {
      token: signToken(payload),
      user: toPublicUser(user),
    };
  },

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    return {
      token: signToken(payload),
      user: toPublicUser(user),
    };
  },
};

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return toPublicUser(user);
  },

  async updateProfile(
    userId: string,
    data: { displayName?: string; phone?: string; avatarUrl?: string }
  ) {
    const updateData = { ...data };
    if (updateData.avatarUrl === "") {
      updateData.avatarUrl = undefined;
    }

    const user = await userRepository.updateProfile(userId, updateData);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return toPublicUser(user);
  },

  async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, passwordHash);
  },
};
