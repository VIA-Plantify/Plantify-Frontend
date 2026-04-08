import axios from "axios";

const api = axios.create({

    baseURL: "http://localhost:3021/api",
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