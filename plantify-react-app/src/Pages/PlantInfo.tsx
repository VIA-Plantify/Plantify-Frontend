import { useEffect, useState } from "react";
import styles from "./Stylesheets/PlantInfo.module.css";
import plantImage from '../assets/newplant.placeholder.png';
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { getPlants, createPlant } from "../api/Plants/plantApi.ts";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes.ts";


export function PlantInfo() {
    const [plant, setPlant] = useState<Plant | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlant = async () => {
            try {
                const plants = await getPlants();
                console.log("plants:", plants);
                setPlant(plants[0] ?? null);
            } catch (err) {
                const { message } = getErrorMessage(err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlant();
    }, []);

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
                </div>

                <div className={styles["center-image"]}>
                    <img
                        className={styles["plant-image"]}
                        src={plantImage}
                        alt="Plant"
                    />
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
                        <span className={styles["box-label"]}>Humidity</span>
                        <span className={styles["box-value"]}>
                            {isLoading ? "..." : (
                                plant?.optimalAirHumidity != null
                                    ? `${plant.optimalAirHumidity}%`
                                    : "—"
                            )}
                        </span>
                    </div>
                </div>

                {error && <p className={styles["error-text"]}>{error}</p>}

                <button onClick={handleCreate}>Create Test Plant</button>

                <p><Link className={styles.link} to="/">Back up for now</Link></p>
            </div>
        </div>
    );
}

export default PlantInfo;