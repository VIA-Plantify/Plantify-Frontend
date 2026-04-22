import type { ApiError } from "./authTypes";

export const getErrorMessage = (error: unknown): ApiError => {
    if (!isAxiosError(error)) {
        return {
            status: 0,
            message: (error as Error).message || "An unexpected error occurred"
        };
    }

    const response = error.response;

    if (!response) {
        return {
            status: 0,
            message: "Cannot connect to server"
        };
    }

    const { status, data } = response;
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
};

// Minimal Axios error shape check (avoids importing axios just for the guard)
function isAxiosError(error: unknown): error is {
    response?: { status: number; data: any };
    request?: unknown;
    message?: string;
} {
    return typeof error === "object" && error !== null && "isAxiosError" in error;
}