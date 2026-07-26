export type AuthUser = {
  uid: string;
  email: string;
  nickname: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  nickname: string;
};
