import { User } from "../models/user-model";
import type { IUser } from "../models/user-model";
import { toUserDto, toUserWithPasswordDto, type UserDTO, type UserWithPasswordDTO } from "../mappers/user.mapper";

export const dbAdapter = {
  async findAllUsers(): Promise<UserDTO[]> {
    const users = await User.find({}, { password: 0 });
    return users.map(toUserDto);
  },

  async findUserById(id: string): Promise<UserDTO | null> {
    const user = await User.findById(id, { password: 0 });
    return user ? toUserDto(user) : null;
  },

  async findUserDocById(id: string): Promise<any | null> {
    return User.findById(id);
  },

  async findUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await User.findOne({ email }, { password: 0 });
    return user ? toUserDto(user) : null;
  },

  async findUserByEmailWithPassword(email: string): Promise<UserWithPasswordDTO | null> {
    const user = await User.findOne({ email });
    return user ? toUserWithPasswordDto(user) : null;
  },

  async createUser(data: {
    name: string;
    email: string;
    age?: number;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<UserDTO> {
    const created = await User.create(data as Partial<IUser>);
    return toUserDto(created);
  },

  async updateUser(userDoc: any, updateData: any): Promise<UserDTO> {
    Object.assign(userDoc, updateData);

    if (typeof userDoc?.save === "function") {
      const saved = await userDoc.save();
      return toUserDto(saved);
    }

    const anyUser: any = User as any;
    if (typeof anyUser.save === "function") {
      const saved = await anyUser.save(userDoc);
      return toUserDto(saved);
    }

    throw new TypeError("updateUser expected a document with save() or a model with save()");
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await User.deleteOne({ _id: id });
    return (res.deletedCount ?? 0) > 0;
  },
};
