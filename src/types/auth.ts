export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  profileImage?: string;
};

export type ProfileResponse = {
  user: User;
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  birthDate: string;
  phone: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};