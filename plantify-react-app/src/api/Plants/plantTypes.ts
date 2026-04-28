export interface Plant {
    mac: string;
    name: string;
    optimalTemperature: number;
    optimalAirHumidity: number;
    optimalSoilHumidity: number;
    optimalLightIntensity: number;
    optimalLightPeriod: string;   // TimeSpan → "hh:mm:ss"
    temperatureScale: number;     // "C" or "F"
}

export interface CreatePlantRequest {
    mac: string;
    name: string;
    username: string;
    optimalTemperature: number;
    optimalAirHumidity: number;
    optimalWaterLevel: number;
    optimalWaterIntake: number;
    optimalSoilHumidity: number;
    optimalLightIntensity: number;
    optimalLightPeriod: string;
}

export interface UpdatePlantRequest {
    name: string;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
    optimalLightPeriod?: string;  // "hh:mm:ss"
    temperatureScale?: string;    // "C" or "F"
}