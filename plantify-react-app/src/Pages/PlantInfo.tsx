import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Stylesheets/PlantInfo.module.css";
import Cookies from "js-cookie";
import { getPlant, getPlants } from "../api/Plants/plantApi.ts";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes.ts";
import plantImg from "../assets/plant.placeholder.png";

export function PlantInfo() {
    const navigate = useNavigate();
    const [plant, setPlant] = useState<Plant | null>(null);
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMac, setSelectedMac] = useState("84:f3:eb:95:b4:b3");

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";

    useEffect(() => {
        fetchPlant(selectedMac);
        fetchAllPlants();
    }, [selectedMac]);

    const fetchPlant = async (mac: string) => {
        setIsLoading(true);
        try {
            const data = await getPlant(mac, 10);
            setPlant(data ?? null);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllPlants = async () => {
        try {
            const plants = await getPlants();
            setAllPlants(plants);
        } catch (err) {
            console.error("Failed to fetch plants list", err);
        }
    };

    const handleAddPlant = () => {
        console.log("Add Plant clicked – no logic attached");
    };

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/login");
    };

    const scaleLabel = plant?.temperatureScale === 0 ? "°C" : "°F";

    const metrics = [
        { label: "Light", value: plant?.optimalLightIntensity ?? null, unit: "%", key: "light" },
        { label: "Soil Humidity", value: plant?.optimalSoilHumidity ?? null, unit: "%", key: "soil" },
        { label: "Air Humidity", value: plant?.optimalAirHumidity ?? null, unit: "%", key: "air" },
        { label: "Temperature", value: plant?.optimalTemperature ?? null, unit: scaleLabel, key: "temp" }
    ];

    const leftMetrics = metrics.slice(0, 2);
    const rightMetrics = metrics.slice(2, 4);

    const readings = plant?.soilHumidity?.pastReadings || [];
    const chartData = readings.slice(0, 20);


    const renderLineChart = () => {
        if (chartData.length === 0) {
            return <p className={styles["no-data"]}>No soil humidity data available</p>;
        }

        const width = 800;
        const height = 300;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        const maxValue = 100;
       // const minValue = 0;

        const xStep = chartWidth / (chartData.length - 1);
        const points = chartData.map((value, index) => {
            const x = padding + index * xStep;
            const y = padding + chartHeight - (value / maxValue) * chartHeight;
            return `${x},${y}`;
        }).join(" ");

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">

                <rect width={width} height={height} fill="#f9f9f9" rx="10" />

                {[0, 25, 50, 75, 100].map((level) => {
                    const y = padding + chartHeight - (level / maxValue) * chartHeight;
                    return (
                        <g key={level}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="#ddd"
                                strokeWidth="1"
                                strokeDasharray="4"
                            />
                            <text
                                x={padding - 8}
                                y={y + 4}
                                fontSize="11"
                                fill="#888"
                                textAnchor="end"
                            >
                                {level}%
                            </text>
                        </g>
                    );
                })}


                <polyline
                    points={points}
                    fill="none"
                    stroke="#11ae5e"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />


                {chartData.map((value, index) => {
                    const x = padding + index * xStep;
                    const y = padding + chartHeight - (value / maxValue) * chartHeight;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#11ae5e"
                            stroke="white"
                            strokeWidth="2"
                        />
                    );
                })}


                {chartData.map((_, index) => {
                    const x = padding + index * xStep;
                    if (index % Math.ceil(chartData.length / 5) === 0 || index === chartData.length - 1) {
                        return (
                            <text
                                key={index}
                                x={x}
                                y={height - padding + 15}
                                fontSize="10"
                                fill="#888"
                                textAnchor="middle"
                            >
                                {index + 1}
                            </text>
                        );
                    }
                    return null;
                })}


                <text
                    x={width / 2}
                    y={height - 8}
                    fontSize="12"
                    fill="#11ae5e"
                    textAnchor="middle"
                    fontWeight="bold"
                >
                    Reading Number
                </text>
                <text
                    x={15}
                    y={height / 2}
                    fontSize="12"
                    fill="#11ae5e"
                    textAnchor="middle"
                    fontWeight="bold"
                    transform={`rotate(-90, 15, ${height / 2})`}
                >
                    Humidity (%)
                </text>
            </svg>
        );
    };

    return (
        <div className={styles["plant-info-container"]}>

            <div className={styles["top-bar"]}>
                <div className={styles["left-buttons"]}>
                    <button className={styles["add-btn"]} onClick={handleAddPlant}>
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
                    <button className={styles["logout-btn"]} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>


            <div className={styles["plant-info-content"]}>
                <div className={styles["left-boxes"]}>
                    {leftMetrics.map((metric) => (
                        <div key={metric.key} className={styles.box}>
                            <div className={styles["box-label"]}>{metric.label}</div>
                            <div className={styles["box-value"]}>
                                {isLoading ? "..." : (
                                    metric.value != null
                                        ? `${metric.value}${metric.unit}`
                                        : "—"
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles["center-image"]}>
                    <img
                        className={styles["plant-image"]}
                        src={plantImg}
                        alt="Plant"
                    />
                </div>

                <div className={styles["right-boxes"]}>
                    {rightMetrics.map((metric) => (
                        <div key={metric.key} className={styles.box}>
                            <div className={styles["box-label"]}>{metric.label}</div>
                            <div className={styles["box-value"]}>
                                {isLoading ? "..." : (
                                    metric.value != null
                                        ? `${metric.value}${metric.unit}`
                                        : "—"
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <div className={styles["chart-section"]}>
                <h3 className={styles["chart-title"]}>Soil Humidity History</h3>
                {isLoading ? (
                    <p>Loading chart...</p>
                ) : (
                    renderLineChart()
                )}
            </div>

            {error && <p className={styles["error-text"]}>{error}</p>}
        </div>
    );
}

export default PlantInfo;