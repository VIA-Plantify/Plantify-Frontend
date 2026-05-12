export interface Plant {
    mac: string;
    name: string;
    username: string;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
    optimalLightPeriod?: number;  // bigint in DB
    temperatureScale?: number;
    soilHumidity?: SoilHumidity;
    waterLevel?: WaterLevel;
}

export interface WaterLevel {
    pastReadings: number[];
    value: number;
}
export interface CreatePlantRequest {
    mac: string;
    name: string;
    username: string;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
    optimalLightPeriod?: number;
}

export interface UpdatePlantRequest {
    name: string;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
    optimalLightPeriod?: number;
    temperatureScale?: number;
}

export interface SoilHumidity {
    pastReadings: number[];
    value: number;
}