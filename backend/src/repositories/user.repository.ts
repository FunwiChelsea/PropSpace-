import { User, IUser } from "../models/User.js";

export const userRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  },

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  },

  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  },

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  },

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select("+passwordHash");
  },

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName?: string;
  }): Promise<IUser> {
    return User.create(data);
  },

  async updateProfile(
    id: string,
    data: { displayName?: string; phone?: string; avatarUrl?: string }
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await User.findByIdAndUpdate(id, { passwordHash });
  },
};
