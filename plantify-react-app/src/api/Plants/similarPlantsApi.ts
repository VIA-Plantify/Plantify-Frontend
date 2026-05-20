import api from "../axiosInstance";

export interface SimilarPlant {
    id: number;
    common: string;
    latin: string;
    category: string;
    climate: string;
    ideallight: string;
    toleratedlight: string;
    watering: string;
    tempmax: number;
    tempmin: number;
}

export const getSimilarPlants = async (
    ideallight: string,
    toleratedlight: string,
    watering: string,
    climate: string,
    tempmax: number,
    tempmin: number
): Promise<SimilarPlant[]> => {
    const response = await api.get<SimilarPlant[]>("/SimilarPlants", {
        params: { ideallight, toleratedlight, watering, climate, tempmax, tempmin }
    });
    return response.data;
};