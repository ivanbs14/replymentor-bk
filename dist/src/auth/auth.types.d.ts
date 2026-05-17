export type AuthPayload = {
    email: string;
    password: string;
};
export type JwtPayload = {
    sub: string;
    email: string;
    exp: number;
};
