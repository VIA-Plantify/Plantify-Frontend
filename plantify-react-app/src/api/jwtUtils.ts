import type { JwtPayload } from "./authTypes";


export const decodeToken = (token: string): JwtPayload | null => {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
};

export const isTokenExpired = (payload: JwtPayload): boolean => {
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
};

export const getTokenFromCookie = (cookieName = "token"): string | null => {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${cookieName}=`));

    return match ? match.split("=")[1] ?? null : null;
};