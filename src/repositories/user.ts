import { IUser, User } from "../mongodb/user-model";

export interface IUserRepo {
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  create(data: IUser): Promise<IUser>;
  update(userDoc: IUser, update: Partial<IUser>): Promise<IUser | null>;
  deleteById(id: string): Promise<boolean>;
  save(userDoc: IUser): Promise<IUser | null>;
}

export const userRepo: IUserRepo = {
  findAll: async () => User.find({}, { password: 0 }),
  findById: async (id) => User.findById(id, { password: 0 }),
  findByEmail: async (email) => User.findOne({ email }, { password: 0 }),
  findByEmailWithPassword: async (email) => User.findOne({ email }),
  create: async (data) => User.create(data),
  update: async (userDoc, update) => {
    Object.assign(userDoc, update);
    return userDoc.save();
  },
  deleteById: async (id) => {
    const res = await User.deleteOne({ _id: id });
    return (res.deletedCount ?? 0) > 0;
  },
  save: function (userDoc: IUser): Promise<IUser | null> {
    throw new Error("Function not implemented.");
  },
};
