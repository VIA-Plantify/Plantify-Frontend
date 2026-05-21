import mlApi from "./malPlantInstance.ts"
import type {SimilarPlant} from "./plantTypes.ts";


export const getPumpTime = async (username: string, plantMac: string): Promise<number> => {
    const encodedMac = encodeURIComponent(plantMac);
    const response = await mlApi.get(`/pumptime/${username}/${encodedMac}`);
    return Number(response.data);
};

export const getSimilarPlants = async (
    ideallight: string,
    toleratedlight: string,
    watering: string,
    climate: string,
    tempmax: number,
    tempmin: number,
    n_recommendations: number = 5
): Promise<SimilarPlant[]> => {
    const response = await mlApi.post<SimilarPlant[]>("/plantcare/recommend", {
        climate,
        ideallight,
        toleratedlight,
        watering,
        tempmax_celsius: tempmax,
        tempmin_celsius: tempmin,
        n_recommendations,
    });
    return response.data;
};