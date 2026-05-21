import axios from "axios";

const mlApi = axios.create({
    baseURL: import.meta.env.VITE_AZURE_API_FOR_ML,
    headers: { "Content-Type": "application/json" }
});

export default mlApi;