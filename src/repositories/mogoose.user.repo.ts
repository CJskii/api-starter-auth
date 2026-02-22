import { IUser } from "../mongodb/user-model";
import { User } from "../mongodb/user-model";
import { IUserRepo } from "./user";

const userRepository: IUserRepo = {
  findById: async (id: string) => {
    return await User.findById(id, { password: 0 });
  },

  findByIdWithPassword: async (id: string) => {
    return await User.findById(id);
  },

  findByEmail: async (email: string) => {
    return await User.findOne({ email }, { password: 0 });
  },

  findByEmailWithPassword: async (email: string) => {
    return await User.findOne({ email });
  },

  create: async (data: IUser) => {
    return await User.create(data);
  },

  update: async (userDoc: IUser, update: Partial<IUser>) => {
    return await User.findByIdAndUpdate(userDoc._id, update, { new: true, runValidators: true });
  },

  deleteById: async (id: string) => {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  },
  
  findAll: async () => {
    return await User.find({}, { password: 0 });
  }
};

export default userRepository;
