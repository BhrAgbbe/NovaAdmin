export interface User {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly username: string;
  readonly email: string;
  readonly phone: string;
}

export interface LoginInput {
  readonly username: string;
  readonly password: string;
}

export type UserInput = Omit<User, "id"> & Pick<LoginInput, "password">;
