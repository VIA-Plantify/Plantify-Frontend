import api from "../axiosInstance";
import type { Plant, CreatePlantRequest } from "./plantTypes.ts";

export const getPlants = async (): Promise<Plant[]> => {
    const response = await api.get<Plant[]>("/Plant");
    return response.data;
};

export const getPlant = async (mac: string): Promise<Plant> => {
    const response = await api.get<Plant>(`/Plant/p/${mac}`);
    return response.data;
};

export const createPlant = async (data: CreatePlantRequest): Promise<Plant> => {
    const response = await api.post<Plant>("/Plant", {
        MAC: data.mac,
        Name: data.name,
        Username: data.username,
        OptimalTemperature: data.optimalTemperature,
        OptimalAirHumidity: data.optimalAirHumidity,
        OptimalWaterLevel: data.optimalWaterLevel,
        OptimalWaterIntake: data.optimalWaterIntake,
        OptimalSoilHumidity: data.optimalSoilHumidity,
        OptimalLightIntensity: data.optimalLightIntensity,
        OptimalLightPeriod: data.optimalLightPeriod,
        WaterLevel: {},
        WaterIntake: {},
        Temperature: {},
        AirHumidity: {},
        SoilHumidity: {},
        LightIntensity: {},
    });
    return response.data;
};

export const updatePlant = async (mac: string, data: Plant): Promise<void> => {
    await api.put(`/Plant/${mac}`, data);
};

export const deletePlant = async (mac: string): Promise<void> => {
    await api.delete(`/Plant/${mac}`);
};