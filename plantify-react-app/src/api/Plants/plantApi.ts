import api from "../axiosInstance";
import type { Plant, CreatePlantRequest } from "./plantTypes";

export const getPlants = async (numberOfSensorReadings?: number, numberOfWateringReadings?: number): Promise<Plant[]> => {
    const response = await api.get<Plant[]>("/Plant", {
        params: { numberOfSensorReadings, numberOfWateringReadings }
    });
    return response.data;
};

export const getPlant = async (mac: string, numberOfSensorReadings?: number, numberOfWateringReadings?: number): Promise<Plant> => {
    const response = await api.get<Plant>(`/Plant/p/${mac}`, {
        params: { numberOfSensorReadings, numberOfWateringReadings }
    });
    return response.data;
};

export const createPlant = async (data: CreatePlantRequest): Promise<Plant> => {
    const response = await api.post<Plant>("/Plant", {
        MAC: data.mac,
        Name: data.name,
        Username: data.username,
        OptimalTemperature: data.optimalTemperature ?? 0,
        OptimalAirHumidity: data.optimalAirHumidity ?? 0,
        OptimalSoilHumidity: data.optimalSoilHumidity ?? 0,
        OptimalLightIntensity: data.optimalLightIntensity ?? 0,
    });
    return response.data;
};

export const updatePlant = async (mac: string, data: Partial<CreatePlantRequest>): Promise<void> => {
    await api.put(`/Plant/${mac}`, {
        MAC: mac,
        Name: data.name,
        Username: data.username,
        Scale: data.scale,
        OptimalTemperature: data.optimalTemperature ?? 0,
        OptimalAirHumidity: data.optimalAirHumidity ?? 0,
        OptimalSoilHumidity: data.optimalSoilHumidity ?? 0,
        OptimalLightIntensity: data.optimalLightIntensity ?? 0,
    });
};
export const convertTemperature = async (mac: string, scale: number): Promise<void> => {
    await api.put(`/Plant/temperature/${mac}`, null, {
        params: { scale },
    });
};
export const deletePlant = async (mac: string): Promise<void> => {
    await api.delete(`/Plant/${mac}`);
};