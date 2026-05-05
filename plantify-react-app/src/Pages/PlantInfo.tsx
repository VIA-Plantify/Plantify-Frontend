import { useEffect, useState } from "react";
import styles from "./Stylesheets/PlantInfo.module.css";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import {getPlants, createPlant, getPlant} from "../api/Plants/plantApi.ts";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes.ts";


export function PlantInfo() {
    const [plant, setPlant] = useState<Plant | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlant = async () => {
            try {
                const plants = await getPlant("84:f3:eb:95:b4:b3", 10);
                console.log("plants:", plants);
                setPlant(plants ?? null);
            } catch (err) {
                const { message } = getErrorMessage(err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };


        fetchPlant();
    }, []);

    const fetchPlantOnReload = async () => {
        try {
            const plants = await getPlant("84:f3:eb:95:b4:b3", 10);
            console.log("plants:", plants);
            setPlant(plants ?? null);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const userStr = Cookies.get("user");
            if (!userStr) throw new Error("Not logged in");
            const user = JSON.parse(decodeURIComponent(userStr));

            await createPlant({
                mac: "AA:BB:CC:DD:EE:FE",
                name: "Test Plant1",
                username: user.username,
                optimalTemperature: 22,
                optimalAirHumidity: 60,
                optimalWaterLevel: 80,
                optimalWaterIntake: 50,
                optimalSoilHumidity: 50,
                optimalLightIntensity: 30,
                optimalLightPeriod: "12:00:00"
            });
            const plants = await getPlants();
            setPlant(plants[0] ?? null);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        }
    };

    const scaleLabel = plant?.temperatureScale === 0 ? "°C" : "°F";

    return (

        <div className={styles["plant-info-container"]}>
            <div className={styles["plant-info-content"]}>
                <div className={styles["left-boxes"]}>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}>Name</span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (plant?.name ?? "—")}
                        </span>
                    </div>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}>MAC</span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (plant?.mac ?? "—")}
                        </span>
                    </div>
                    <div className={styles.box}>

                        <span className={styles["box-label"]}>Username: </span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (plant?.username ?? "—")}
                        </span>
                    </div>
                    <div className={styles.box}>

                        <span className={styles["box-label"]}>Soil humidity value:{plant?.soilHumidity.value ?? "—"} </span>

                    </div>


                </div>


                <div className={styles["right-boxes"]}>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}>Temperature</span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (
                                plant?.optimalTemperature != null
                                    ? `${plant.optimalTemperature}${scaleLabel}`
                                    : "—"
                            )}
                        </span>
                    </div>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}>Air Humidity: </span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (
                                plant?.optimalAirHumidity != null
                                    ? `${plant.optimalAirHumidity}%`
                                    : "—"
                            )}
                        </span>
                    </div>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}> Soil Humidity </span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (
                                plant?.optimalSoilHumidity != null
                                    ? `${plant.optimalSoilHumidity}%`
                                    : "—"
                            )}
                        </span>
                    </div>
                    <div className={styles.box}>
                        <span className={styles["box-label"]}> Light Intensity </span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (
                                plant?.optimalLightIntensity != null
                                    ? `${plant.optimalLightIntensity}%`
                                    : "—"
                            )}
                        </span>
                    </div>

                </div>

                {error && <p className={styles["error-text"]}>{error}</p>}

                <button onClick={handleCreate}>Create Test Plant</button>
                <button onClick={fetchPlantOnReload}>Reload Plant info</button>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "10px"
                    }}
                >
                    {isLoading ? (
                        "..."
                    ) : plant?.soilHumidity.pastReadings?.length ? (
                        plant.soilHumidity.pastReadings
                            .slice(0, 10)
                            .map((reading, index) => (
                                <span
                                    key={index}
                                    style={{
                                        flex: "0 0 calc(33.33% - 8px)",
                                        boxSizing: "border-box",
                                        padding: "4px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        textAlign: "center"
                                    }}
                                >
                    {reading}%
                </span>
                            ))
                    ) : (
                        "—"
                    )}
                </div>

                <p><Link className={styles.link} to="/">Back up for now</Link></p>
            </div>
        </div>
    );
}

export default PlantInfo;