import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Stylesheets/PlantInfo.module.css";
import Cookies from "js-cookie";
import { getPlant, getPlants, updatePlant } from "../api/Plants/plantApi";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes";
import plantImg from "../assets/PLANT.png";
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';

function PlantPot({ waterLevel, isLoading }: { waterLevel: number; isLoading: boolean }) {
    const level = isLoading ? 0 : Math.min(100, Math.max(0, waterLevel ?? 0));

    const potTopY    = 180;
    const potBottomY = 300;
    const potH       = potBottomY - potTopY;
    const topL = 30,  topR = 170;
    const botL = 62,  botR = 138;

    const waterH = (level / 100) * potH;
    const waterY = potBottomY - waterH;
    const t  = waterH / potH;
    const wL = botL + t * (topL - botL);
    const wR = botR + t * (topR - botR);

    const waterColor =
        level < 20 ? "#e07b54" :
            level < 40 ? "#e8a84c" :
                "#11ae5e";

    const waveLight =
        level < 20 ? "#f0a080" :
            level < 40 ? "#f0c070" :
                "#4ecf8a";

    const imgBottomPct = (160 / 330) * 100;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%" }}>
            <style>{`
                @keyframes ppWave1 { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
                @keyframes ppWave2 { from { transform: translateX(-50%); } to { transform: translateX(0); }    }
                @keyframes ppBubble {
                    0%   { transform: translateY(0);     opacity: .7; }
                    100% { transform: translateY(-80px); opacity: 0;  }
                }
                .pp-w1 { animation: ppWave1 2.4s linear infinite; }
                .pp-w2 { animation: ppWave2 3.2s linear infinite; }
                .pp-b1 { animation: ppBubble 2.8s ease-in infinite 0.5s; }
                .pp-b2 { animation: ppBubble 3.5s ease-in infinite 1.5s; }
                .pp-b3 { animation: ppBubble 2.2s ease-in infinite 0.9s; }
            `}</style>

            <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
                <img
                    src={plantImg}
                    alt="Plant"
                    style={{
                        position: "absolute",
                        bottom: `${imgBottomPct}%`,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "110%",
                        zIndex: 3,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                />

                <svg
                    viewBox="0 0 200 330"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "100%", display: "block", filter: "drop-shadow(0 8px 24px rgba(0,0,0,.25))" }}
                    aria-label={`Water level: ${level}%`}
                >
                    <defs>
                        <clipPath id="ppClip">
                            <polygon points={`${topL+2},${potTopY} ${topR-2},${potTopY} ${botR-2},${potBottomY} ${botL+2},${potBottomY}`} />
                        </clipPath>
                    </defs>

                    <polygon points={`${topL},${potTopY} ${topR},${potTopY} ${botR},${potBottomY} ${botL},${potBottomY}`}
                             fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="2" />
                    <polygon points={`${topL},${potTopY} ${topL+12},${potTopY} ${botL+6},${potBottomY} ${botL},${potBottomY}`}
                             fill="#111" opacity=".5" />
                    <polygon points={`${topR-12},${potTopY} ${topR},${potTopY} ${botR},${potBottomY} ${botR-6},${potBottomY}`}
                             fill="#444" opacity=".4" />

                    <g clipPath="url(#ppClip)">
                        <polygon
                            points={`${wL},${waterY} ${wR},${waterY} ${botR-2},${potBottomY} ${botL+2},${potBottomY}`}
                            fill={waterColor} opacity=".75"
                            style={{ transition: "all .8s ease" }}
                        />
                        {level > 2 && (
                            <g style={{ transform: `translateY(${waterY - 7}px)`, transition: "transform .8s ease" }}>
                                <g className="pp-w1">
                                    <path d="M-10,6 Q17.5,0 45,6 Q72.5,12 100,6 Q127.5,0 155,6 Q182.5,12 210,6 Q237.5,0 265,6 V22 H-10 Z"
                                          fill={waveLight} opacity=".65" />
                                </g>
                            </g>
                        )}
                        {level > 2 && (
                            <g style={{ transform: `translateY(${waterY - 3}px)`, transition: "transform .8s ease" }}>
                                <g className="pp-w2">
                                    <path d="M-10,4 Q17.5,10 45,4 Q72.5,-2 100,4 Q127.5,10 155,4 Q182.5,-2 210,4 Q237.5,10 265,4 V22 H-10 Z"
                                          fill={waterColor} opacity=".5" />
                                </g>
                            </g>
                        )}
                        {level > 10 && (
                            <>
                                <circle className="pp-b1" cx="85"  cy="290" r="2.5" fill="white" opacity=".6" />
                                <circle className="pp-b2" cx="110" cy="285" r="2"   fill="white" opacity=".6" />
                                <circle className="pp-b3" cx="95"  cy="288" r="2"   fill="white" opacity=".6" />
                            </>
                        )}
                    </g>

                    <rect x={topL - 4} y={potTopY - 10} width={topR - topL + 8} height="14" rx="5"
                          fill="#222" stroke="#111" strokeWidth="1.5" />
                    <rect x={topL - 4} y={potTopY - 10} width={topR - topL + 8} height="6" rx="4"
                          fill="#3a3a3a" />

                    <rect x={botL - 2} y={potBottomY - 4} width={botR - botL + 4} height="10" rx="5" fill="#1a1a1a" />
                    <ellipse cx="100" cy={potBottomY + 8} rx="48" ry="7" fill="#222" stroke="#111" strokeWidth="1.5" />
                    <ellipse cx="100" cy={potBottomY + 8} rx="38" ry="4" fill="#333" opacity=".5" />

                    {[25, 50, 75].map((mark) => {
                        const mY = potBottomY - (mark / 100) * potH;
                        const mT = mark / 100;
                        const mL = botL + mT * (topL - botL);
                        const mR = botR + mT * (topR - botR);
                        return (
                            <g key={mark} opacity=".3">
                                <line x1={mL + 4} y1={mY} x2={mL + 12} y2={mY} stroke="white" strokeWidth="1.5" />
                                <line x1={mR - 12} y1={mY} x2={mR - 4} y2={mY} stroke="white" strokeWidth="1.5" />
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "70%", maxWidth: 200, marginTop: 8 }}>
                <span style={{ fontSize: 22, fontWeight: "bold", color: waterColor, transition: "color .8s ease" }}>
                    {isLoading ? "—" : `${level}%`}
                </span>
                <div style={{ width: "100%", height: 10, background: "#e0e0e0", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                        height: "100%", borderRadius: 999,
                        width: `${level}%`,
                        backgroundColor: waterColor,
                        transition: "width .8s ease, background-color .8s ease",
                    }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: waterColor, transition: "color .8s ease" }}>
                    Water level
                </span>
            </div>
        </div>
    );
}

export function PlantInfo() {

    const navigate = useNavigate();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";
    const { theme } = useTheme();

    const [plant, setPlant] = useState<Plant | null>(null);
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMac, setSelectedMac] = useState<string>("");

    useEffect(() => { fetchAllPlants(); }, []);
    useEffect(() => { if (selectedMac) fetchPlant(selectedMac); }, [selectedMac]);

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

    const handleScaleToggle = async () => {
        if (!plant) return;
        try {
            const newScale = plant.scale === 0 ? 1 : 0;
            await updatePlant(plant.mac, {
                mac: plant.mac,
                name: plant.name,
                username: plant.username,
                scale: newScale,
                optimalTemperature: plant.optimalTemperature,
                optimalAirHumidity: plant.optimalAirHumidity,
                optimalSoilHumidity: plant.optimalSoilHumidity,
                optimalLightIntensity: plant.optimalLightIntensity,
            });
            await fetchPlant(plant.mac);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        }
    };

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/");
    };

    const scaleLabel = plant?.scale === 0 ? "°C" : "°F";
    const waterLevel = plant?.watering?.waterLevel ?? 0;

    const metrics = [
        { label: "Light",         value: plant?.optimalLightIntensity ?? null, unit: "%",        key: "light" },
        { label: "Soil Humidity", value: plant?.optimalSoilHumidity   ?? null, unit: "%",        key: "soil"  },
        { label: "Air Humidity",  value: plant?.optimalAirHumidity    ?? null, unit: "%",        key: "air"   },
        { label: "Temperature",   value: plant?.optimalTemperature    ?? null, unit: scaleLabel, key: "temp"  },
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
        const chartWidth  = width  - 2 * padding;
        const chartHeight = height - 2 * padding;
        const xStep  = data.length > 1 ? chartWidth / (data.length - 1) : 0;
        const points = data.map((value, index) => {
            const x = padding + index * xStep;
            const y = padding + chartHeight - (value / 100) * chartHeight;
            return `${x},${y}`;
        }).join(" ");

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className={styles["graph"]}>
                <rect width={width} height={height} fill="#f9f9f9" rx="10" />
                {[0, 25, 50, 75, 100].map((level) => {
                    const y = padding + chartHeight - (level / 100) * chartHeight;
                    return (
                        <g key={level}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#ddd" strokeWidth="1" strokeDasharray="4" />
                            <text x={padding - 8} y={y + 4} fontSize="11" fill="#888" textAnchor="end">{level}%</text>
                        </g>
                    );
                })}
                <polyline points={points} fill="none" stroke="#11ae5e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {data.map((value, index) => {
                    const x = padding + index * xStep;
                    const y = padding + chartHeight - (value / 100) * chartHeight;
                    return <circle key={index} cx={x} cy={y} r="4" fill="#11ae5e" stroke="white" strokeWidth="2" />;
                })}
                <text x={width / 2} y={height - 8} fontSize="12" fill="#11ae5e" textAnchor="middle" fontWeight="bold">Reading Number</text>
                <text x={15} y={height / 2} fontSize="12" fill="#11ae5e" textAnchor="middle" fontWeight="bold" transform={`rotate(-90, 1, ${height / 2})`}>Humidity (%)</text>
            </svg>
        );
    };

    return (
        <div className={`${styles["plant-info-container"]} ${theme === 'dark' ? styles.dark : ''}`}>

            <div className={styles["top-bar"]}>
                <div className={styles["left-buttons"]}>
                    <button className={styles["add-btn"]} onClick={() => navigate("/AddPlant")}>
                        + Add Plant
                    </button>
                    <button className={styles["add-btn"]} onClick={handleScaleToggle} disabled={!plant}>
                        {plant?.scale === 0 ? "Switch to °F" : "Switch to °C"}
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
                    <ThemeToggle/>
                    <button className={styles["logout-btn"]} onClick={handleLogout}>Logout</button>

                </div>
            </div>

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
                    <PlantPot waterLevel={waterLevel} isLoading={isLoading} />
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

            {plant?.sensorData && (
                <div className={styles["chart-section"]} style={{ marginTop: "20px" }}>
                    <h3 className={styles["chart-title"]}>Latest sensor reading</h3>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        {[
                            { label: "Temperature",   value: plant.sensorData.temperature,    unit: scaleLabel },
                            { label: "Air Humidity",  value: plant.sensorData.airHumidity,    unit: "%" },
                            { label: "Soil Humidity", value: plant.sensorData.soilHumidity,   unit: "%" },
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

            <div className={styles["chart-section"]}>
                <h3 className={styles["chart-title"]}>Soil Humidity History</h3>
                {isLoading ? <p>Loading chart...</p> : renderLineChart()}
            </div>

            {error && <p className={styles["error-text"]}>{error}</p>}
        </div>
    );
}

export default PlantInfo;