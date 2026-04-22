export interface LoginRequest {
    email?: string;
    username?: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username?: string;
    name?: string;
}

export interface AuthUser {
    username: string;
    email: string;
}

export interface JwtPayload {
    Username: string;
    Email: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export interface ApiError {
    status: number;
    message: string;
    errors?: string[];
}