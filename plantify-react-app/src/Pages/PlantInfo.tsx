import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Stylesheets/PlantInfo.module.css";
import Cookies from "js-cookie";
import { getPlant, getPlants } from "../api/Plants/plantApi";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes";
import plantImg from "../assets/plant.placeholder.png";

export function PlantInfo() {
    const navigate = useNavigate();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";

    const [plant, setPlant] = useState<Plant | null>(null);
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMac, setSelectedMac] = useState<string>("");

    useEffect(() => {
        fetchAllPlants();
    }, []);

    useEffect(() => {
        if (selectedMac) fetchPlant(selectedMac);
    }, [selectedMac]);

    const fetchAllPlants = async () => {
        try {
            const plants = await getPlants();
            setAllPlants(plants);
            if (plants.length > 0) setSelectedMac(plants[0].mac);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        }
    };

    const fetchPlant = async (mac: string) => {
        setIsLoading(true);
        try {
            const data = await getPlant(mac, 10, 5);
            setPlant(data ?? null);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/");
    };

    const scaleLabel = plant?.temperatureScale === 0 ? "°C" : "°F";

    const metrics = [
        { label: "Light",        value: plant?.optimalLightIntensity ?? null, unit: "%",       key: "light" },
        { label: "Soil Humidity",value: plant?.optimalSoilHumidity   ?? null, unit: "%",       key: "soil"  },
        { label: "Air Humidity", value: plant?.optimalAirHumidity    ?? null, unit: "%",       key: "air"   },
        { label: "Temperature",  value: plant?.optimalTemperature    ?? null, unit: scaleLabel, key: "temp"  },
    ];

    const leftMetrics  = metrics.slice(0, 2);
    const rightMetrics = metrics.slice(2, 4);

    const soilReadings = plant?.sensorData ? [plant.sensorData.soilHumidity] : [];

    const renderLineChart = () => {
        if (!soilReadings.length || soilReadings.every(v => v == null)) {
            return <p className={styles["no-data"]}>No soil humidity data available</p>;
        }

        const data = soilReadings.filter((v): v is number => v != null);
        const width = 800, height = 300, padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

        const points = data.map((value, index) => {
            const x = padding + index * xStep;
            const y = padding + chartHeight - (value / 100) * chartHeight;
            return `${x},${y}`;
        }).join(" ");

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <rect width={width} height={height} fill="#f9f9f9" rx="10" />
                {[0, 25, 50, 75, 100].map((level) => {
                    const y = padding + chartHeight - (level / 100) * chartHeight;
                    return (
                        <g key={level}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#ddd" strokeWidth="1" strokeDasharray="4"/>
                            <text x={padding - 8} y={y + 4} fontSize="11" fill="#888" textAnchor="end">{level}%</text>
                        </g>
                    );
                })}
                <polyline points={points} fill="none" stroke="#11ae5e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
                {data.map((value, index) => {
                    const x = padding + index * xStep;
                    const y = padding + chartHeight - (value / 100) * chartHeight;
                    return <circle key={index} cx={x} cy={y} r="4" fill="#11ae5e" stroke="white" strokeWidth="2"/>;
                })}
                <text x={width / 2} y={height - 8} fontSize="12" fill="#11ae5e" textAnchor="middle" fontWeight="bold">Reading Number</text>
                <text x={15} y={height / 2} fontSize="12" fill="#11ae5e" textAnchor="middle" fontWeight="bold" transform={`rotate(-90, 15, ${height / 2})`}>Humidity (%)</text>
            </svg>
        );
    };

    return (
        <div className={styles["plant-info-container"]}>

            {/* Top bar */}
            <div className={styles["top-bar"]}>
                <div className={styles["left-buttons"]}>
                    <button className={styles["add-btn"]} onClick={() => navigate("/AddPlant")}>
                        + Add Plant
                    </button>
                    <select
                        className={styles["dropdown"]}
                        value={selectedMac}
                        onChange={(e) => setSelectedMac(e.target.value)}
                    >
                        {allPlants.map((p) => (
                            <option key={p.mac} value={p.mac}>
                                {p.name} ({p.mac})
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles["user-area"]}>
                    <div className={styles["user-info"]}>
                        <span className={styles["user-name"]}>{displayName}</span>
                        <span className={styles["user-username"]}>@{username}</span>
                    </div>
                    <button className={styles["logout-btn"]} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Main layout */}
            <div className={styles["plant-info-content"]}>
                <div className={styles["left-boxes"]}>
                    {leftMetrics.map((metric) => (
                        <div key={metric.key} className={styles.box}>
                            <div className={styles["box-label"]}>{metric.label}</div>
                            <div className={styles["box-value"]}>
                                {isLoading ? "..." : metric.value != null ? `${metric.value}${metric.unit}` : "—"}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles["center-image"]}>
                    <img className={styles["plant-image"]} src={plantImg} alt="Plant"/>
                </div>

                <div className={styles["right-boxes"]}>
                    {rightMetrics.map((metric) => (
                        <div key={metric.key} className={styles.box}>
                            <div className={styles["box-label"]}>{metric.label}</div>
                            <div className={styles["box-value"]}>
                                {isLoading ? "..." : metric.value != null ? `${metric.value}${metric.unit}` : "—"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live sensor readings */}
            {plant?.sensorData && (
                <div className={styles["chart-section"]} style={{ marginTop: "20px" }}>
                    <h3 className={styles["chart-title"]}>Latest sensor reading</h3>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        {[
                            { label: "Temperature",   value: plant.sensorData.temperature,  unit: scaleLabel },
                            { label: "Air Humidity",  value: plant.sensorData.airHumidity,  unit: "%" },
                            { label: "Soil Humidity", value: plant.sensorData.soilHumidity, unit: "%" },
                            { label: "Light",         value: plant.sensorData.lightIntensity, unit: "%" },
                        ].map((s) => (
                            <div key={s.label} className={styles.box} style={{ minWidth: "140px" }}>
                                <div className={styles["box-label"]}>{s.label}</div>
                                <div className={styles["box-value"]}>{s.value != null ? `${s.value}${s.unit}` : "—"}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Watering info */}
            {plant?.watering && (
                <div className={styles["chart-section"]} style={{ marginTop: "20px" }}>
                    <h3 className={styles["chart-title"]}>Watering</h3>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        <div className={styles.box} style={{ minWidth: "160px" }}>
                            <div className={styles["box-label"]}>Last watered</div>
                            <div className={styles["box-value"]} style={{ fontSize: "16px" }}>
                                {plant.watering.lastWaterTime ? new Date(plant.watering.lastWaterTime).toLocaleDateString() : "—"}
                            </div>
                        </div>
                        <div className={styles.box} style={{ minWidth: "160px" }}>
                            <div className={styles["box-label"]}>Water level</div>
                            <div className={styles["box-value"]}>{plant.watering.waterLevel != null ? `${plant.watering.waterLevel}%` : "—"}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Soil humidity chart */}
            <div className={styles["chart-section"]}>
                <h3 className={styles["chart-title"]}>Soil Humidity History</h3>
                {isLoading ? <p>Loading chart...</p> : renderLineChart()}
            </div>

            {error && <p className={styles["error-text"]}>{error}</p>}
        </div>
    );
}

export default PlantInfo;