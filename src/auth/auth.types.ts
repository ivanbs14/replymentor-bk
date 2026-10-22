export type AuthPayload = {
  email: string;
  password: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
};

export type AuthResult = {
  token: string;
  user: { id: string; email: string };
};
