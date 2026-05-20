import api from "./axiosInstance";
import { decodeToken } from "./jwtUtils";
import type { LoginRequest, RegisterRequest, AuthUser } from "./authTypes";

export { getErrorMessage } from "./errorHandler";


export const login = async (data: LoginRequest): Promise<{ data: AuthUser }> => {
    const response = await api.post<string>("/Auth/login", {
        email: data.email,
        username: data.username,
        password: data.password,
        name: data.name
    });

    const token = response.data;

    const payload = decodeToken(token);
    if (!payload) throw new Error("Invalid token received from server");

    console.log("JWT payload:", payload);

    document.cookie = `token=${token}; path=/; SameSite=Lax`;

    return {
        data: {
            username: payload.Username,
            email: payload.Email,
            name: payload.Name
        }
    };
};


export const register = async (data: RegisterRequest): Promise<unknown> => {
    const response = await api.post("/User", {
        email: data.email,
        password: data.password,
        username: data.username ?? data.email.split("@")[0],
        name: data.name ?? data.email.split("@")[0]
    });

    return response.data;
};