export interface Plant {
    mac: string;
    name: string;
    username: string;
    scale?: number;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
    temperatureScale?: number;
    sensorData?: SensorData;
    watering?: Watering;
    previousSensorData?: SensorData[];
    previousWaterings?: Watering[];
}

export interface SensorData {
    temperature?: number;
    airHumidity?: number;
    soilHumidity?: number;
    lightIntensity?: number;
    timestamp?: string;
    plantMAC?: string;
}

export interface Watering {
    pumpTimeInSeconds?: number;
    lastWaterTime?: string;
    predictedFutureWaterTime?: string;
    waterLevel?: number;
    plantMAC?: string;
}

export interface CreatePlantRequest {
    mac: string;
    name: string;
    username: string;
    scale?: number;
    optimalTemperature?: number;
    optimalAirHumidity?: number;
    optimalSoilHumidity?: number;
    optimalLightIntensity?: number;
}