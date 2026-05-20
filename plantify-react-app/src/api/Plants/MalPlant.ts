import axios from "axios";

const mlApi = axios.create({
    baseURL: import.meta.env.VITE_AZURE_API_FOR_ML,
    headers: { "Content-Type": "application/json" }
});

export const getPumpTime = async (username: string, plantMac: string): Promise<number> => {
    const encodedMac = encodeURIComponent(plantMac);
    const response = await mlApi.get(`/pumptime/${username}/${encodedMac}`);
    return Number(response.data);
};