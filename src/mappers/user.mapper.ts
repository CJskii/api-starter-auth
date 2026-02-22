export type UserDTO = {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPasswordDTO = UserDTO & { password: string };

export function toUserDto(user: any): UserDTO {
  const obj = typeof user?.toObject === "function" ? user.toObject() : user;

  return {
    id: String(obj._id ?? obj.id),
    name: obj.name,
    email: obj.email,
    age: obj.age,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

export function toUserWithPasswordDto(user: any): UserWithPasswordDTO {
  const obj = typeof user?.toObject === "function" ? user.toObject() : user;

  return {
    ...toUserDto(obj),
    password: obj.password,
  };
}
