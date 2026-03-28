import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3021/api",
    withCredentials: true
});

export interface LoginRequest {

    email: string;
    username: string;

}

export interface RegisterRequest {

    email: string;
    username: string;

}

export const login = (
    data: LoginRequest
) => api.post("/auth/login", data);

export const register = (
    data: RegisterRequest
) => api.post("/auth/register", data);