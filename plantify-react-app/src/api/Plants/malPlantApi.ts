import mlApi from "./malPlantInstance.ts"


type RecommendResponse = {
    recommended_plants: string[];
    label: string;
    probabilities: Record<string, number>;
};

export const getSimilarPlants = async (
    ideallight: string,
    toleratedlight: string,
    watering: string,
    climate: string,
    tempmax: number,
    tempmin: number,
    n_recommendations: number = 5
): Promise<RecommendResponse> => {
    const response = await mlApi.post<RecommendResponse>("/plantcare/recommend", {
        climate,
        ideallight,
        toleratedlight,
        watering,
        tempmax_celsius: tempmax,
        tempmin_celsius: tempmin,
        n_recommendations,
    });
    return response.data;
};;