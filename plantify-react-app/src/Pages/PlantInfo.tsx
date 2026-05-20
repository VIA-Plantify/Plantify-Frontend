import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Stylesheets/PlantInfo.module.css";
import Cookies from "js-cookie";
import { getPlant, getPlants, convertTemperature } from "../api/Plants/plantApi";
import { getPumpTime } from "../api/Plants/MalPlant";
import { getErrorMessage } from "../api/authApi";
import type { Plant } from "../api/Plants/plantTypes";
//import plant1 from "../assets/plant1.png";
//import plant2 from "../assets/plant2.png";
//import plant3 from "../assets/plant3.png";
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
                    {isLoading ? "—" : `${level.toFixed(1)}%`}
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

const fmt = (value: number | null | undefined) =>
    value != null ? value.toFixed(1) : null;

export function PlantInfo() {

    const navigate = useNavigate();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";
    const { theme } = useTheme();

    const [pumpTime, setPumpTime] = useState<number | null>(null);
    const [plant, setPlant] = useState<Plant | null>(null);
    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMac, setSelectedMac] = useState<string>("");
    const [chartLimit, setChartLimit] = useState<number>(10);
    const [chartLimitInput, setChartLimitInput] = useState<string>("10");

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
            const data = await getPlant(mac, 50, 5);
            setPlant(data ?? null);
            if (data && username) await fetchPumpTime(username, mac);
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPumpTime = async (username: string, mac: string) => {
        try {
            const time = await getPumpTime(username, mac);
            setPumpTime(time);
        } catch {
            setPumpTime(null);
        }
    };

    const handleScaleToggle = async () => {
        if (!plant) return;
        try {
            const newScale = plant.scale === 0 ? 1 : 0;
            console.log(newScale);
            await convertTemperature(plant.mac, newScale);
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
        { label: "Light",         value: fmt(plant?.optimalLightIntensity), unit: "%",        key: "light" },
        { label: "Soil Humidity", value: fmt(plant?.optimalSoilHumidity),   unit: "%",        key: "soil"  },
        { label: "Air Humidity",  value: fmt(plant?.optimalAirHumidity),    unit: "%",        key: "air"   },
        { label: "Temperature",   value: fmt(plant?.optimalTemperature),    unit: scaleLabel, key: "temp"  },
    ];

    const leftMetrics  = metrics.slice(0, 2);
    const rightMetrics = metrics.slice(2, 4);

    const soilReadings = plant?.previousSensorData
        ?.map(s => s.soilHumidity)
        .filter((v): v is number => v != null)
        .slice(-chartLimit) ?? [];

    const renderLineChart = () => {
        if (!soilReadings.length || soilReadings.every(v => v == null)) {
            return <p className={styles["no-data"]}>No soil humidity data available</p>;
        }

        const data = soilReadings.filter((v): v is number => v != null);
        const width = 800, height = 300, padding = 40;
        const chartWidth  = width  - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Dynamic Y axis: min-10 and max+10, clamped to [0, 100]
        const rawMin = Math.min(...data);
        const rawMax = Math.max(...data);
        const yMin = Math.max(0,   rawMin - 10);
        const yMax = Math.min(100, rawMax + 10);
        const yRange = yMax - yMin || 1;

        const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

        // Convert a data value to SVG Y coordinate
        const toY = (value: number) =>
            padding + chartHeight - ((value - yMin) / yRange) * chartHeight;

        const points = data.map((value, index) => {
            const x = padding + index * xStep;
            return `${x},${toY(value)}`;
        }).join(" ");

        const bgColor    = theme === 'dark' ? '#1a1a1a' : '#f9f9f9';
        const gridColor  = theme === 'dark' ? '#333'    : '#ddd';
        const labelColor = theme === 'dark' ? '#aaa'    : '#888';

        // Generate 6 evenly spaced grid lines between yMin and yMax
        const gridSteps = 5;
        const stepSize  = (yMax - yMin) / gridSteps;
        const gridLevels = Array.from({ length: gridSteps + 1 }, (_, i) =>
            Math.round((yMin + i * stepSize) * 10) / 10
        );

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
                 preserveAspectRatio="xMidYMid meet" className={styles["graph"]}>
                <rect width={width} height={height} fill={bgColor} rx="10" />

                {gridLevels.map((level) => {
                    const y = toY(level);
                    return (
                        <g key={level}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y}
                                  stroke={gridColor} strokeWidth="1" strokeDasharray="4" />
                            <text x={padding - 8} y={y + 4} fontSize="11"
                                  fill={labelColor} textAnchor="end">{level}%</text>
                        </g>
                    );
                })}

                <polyline points={points} fill="none" stroke="#11ae5e"
                          strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

                {data.map((value, index) => {
                    const x = padding + index * xStep;
                    return (
                        <circle key={index} cx={x} cy={toY(value)}
                                r="4" fill="#11ae5e" stroke="white" strokeWidth="2" />
                    );
                })}

                <text x={width / 2} y={height - 8} fontSize="12" fill="#11ae5e"
                      textAnchor="middle" fontWeight="bold">Reading Number</text>
                <text x={15} y={height / 2} fontSize="12" fill="#11ae5e"
                      textAnchor="middle" fontWeight="bold"
                      transform={`rotate(-90, 1, ${height / 2})`}>Humidity (%)</text>
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
                    <button className={styles["add-btn"]} onClick={() => navigate("/SimilarPlants")}>
                        Similar Plants
                    </button>
                    <button className={styles["add-btn"]} onClick={() => navigate("/UpdatePlant")}>
                        Update Plant
                    </button>
                    <button className={styles["add-btn"]} onClick={handleScaleToggle}>
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
                            { label: "Temperature",   value: fmt(plant.sensorData.temperature),    unit: scaleLabel },
                            { label: "Air Humidity",  value: fmt(plant.sensorData.airHumidity),    unit: "%" },
                            { label: "Soil Humidity", value: fmt(plant.sensorData.soilHumidity),   unit: "%" },
                            { label: "Light",         value: fmt(plant.sensorData.lightIntensity), unit: "%" },
                            { label: "Pump Time",     value: pumpTime != null ? String(pumpTime) : null, unit: "s" },
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
                            <div className={styles["box-value"]}>{plant.watering.waterLevel != null ? `${fmt(plant.watering.waterLevel)}%` : "—"}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles["chart-section"]}>
                <h3 className={styles["chart-title"]}>Soil Humidity History</h3>
                <div className={styles["chart-limit-row"]}>
                    <label className={styles["chart-limit-label"]}>Number of readings:</label>
                    <input
                        type="number"
                        min="1"
                        max="500"
                        value={chartLimitInput}
                        onChange={(e) => setChartLimitInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const parsed = parseInt(chartLimitInput, 10);
                                if (!isNaN(parsed) && parsed > 0) setChartLimit(parsed);
                            }
                        }}
                        className={styles["chart-limit-input"]}
                    />
                    <button
                        onClick={() => {
                            const parsed = parseInt(chartLimitInput, 10);
                            if (!isNaN(parsed) && parsed > 0) setChartLimit(parsed);
                        }}
                        className={styles["chart-limit-btn"]}
                    >
                        Apply
                    </button>
                </div>
                {isLoading ? <p>Loading chart...</p> : renderLineChart()}
            </div>

            {error && <p className={styles["error-text"]}>{error}</p>}

        </div>
    );
}

export default PlantInfo;