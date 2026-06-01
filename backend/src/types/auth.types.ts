export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
