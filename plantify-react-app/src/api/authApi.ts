import axios from "axios";

const api = axios.create({

    baseURL: "/api",
    withCredentials: true

});


// LOGIN DTO
export interface LoginRequest {

    email?: string;
    username?: string;
    password: string;

}


// REGISTER DTO
export interface RegisterRequest {

    email: string;
    password: string;

    // required by ASP.NET CreateUserDto
    username?: string;
    name?: string;

}



export const login = (

    data: LoginRequest

) => api.post(

    "/auth/login",

    data

);
export interface ApiError {
    status: number;
    message: string;
    errors?: string[];
}
export const getErrorMessage = (error: any): ApiError => {
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        let message = "";

        if (typeof data === "string") {
            if (data.includes("ArgumentException")) {
                const match = data.match(/(\w+ cannot be empty|\w+ is required|\w+ must be)/i);
                message = match ? match[0] : "Validation error";
            } else if (data.includes("already exists")) {
                message = "User already exists";
            } else if (data.includes("Invalid")) {
                message = "Invalid credentials";
            } else {
                message = data.replace(/System\.\w+:/, "").substring(0, 100);
            }
        } else if (data?.message) {
            message = data.message;
        } else if (data?.title) {
            message = data.title;
        } else if (status === 401) {
            message = "Invalid email/username or password";
        } else if (status === 409) {
            message = "User already exists";
        } else if (status === 400) {
            message = "Invalid input data";
        } else {
            message = "An error occurred";
        }

        return { status, message, errors: data?.errors };
    } else if (error.request) {
        return {
            status: 0,
            message: "Cannot connect to server"
        };
    } else {
        return {
            status: 0,
            message: error.message || "An unexpected error occurred"
        };
    }
};
export const register = (

    data: RegisterRequest

) => api.post(

    "/auth/register",

    {

        email: data.email,
        password: data.password,

        // auto-fill because UI has no extra fields yet
        username:
            data.username ??
            data.email.split("@")[0],

        name:
            data.name ??
            data.email.split("@")[0]

    }

);