import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Stylesheets/Similarplants.module.css";
import Cookies from "js-cookie";
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';
import { getSimilarPlants } from "../api/Plants/malPlantApi.ts";

const LIGHT_OPTIONS = [
    { label: "It sits in a dim corner with no direct sun", value: "Diffused" },
    { label: "It gets soft indirect light near a window", value: "Prefers bright, indirect sunlight." },
    { label: "It's in a bright spot, lots of indirect light", value: "Bright light" },
    { label: "It gets some direct sun every day", value: "Direct sunlight" },
    { label: "It's in direct sun for most of the day (6+ hours)", value: "6 or more hours of direct sunlight per day." },
];

const WATERING_OPTIONS = [
    { label: "I keep the soil constantly moist", value: "Keep moist between watering. Must not be dry between watering" },
    { label: "I keep it moist but let it dry a little between waterings", value: "Keep moist between watering. Can be a bit dry between watering" },
    { label: "I water when the soil is about half dry", value: "Water when soil is half dry. Can be dry between watering." },
    { label: "I only water when the soil is fully dry", value: "Water only when dry or when soil is half dry." },
    { label: "I let it dry out completely between waterings", value: "Water only when dry. Must be dry between watering" },
];

const CLIMATE_OPTIONS = [
    { label: "Dry desert-like air", value: "Subtropical arid" },
    { label: "Warm and dry", value: "Arid Tropical" },
    { label: "Mild, average indoor air", value: "Subtropical" },
    { label: "Warm and a bit humid", value: "Tropical" },
    { label: "Warm and very humid (bathroom, kitchen)", value: "Tropical humid" },
];

const MLAPI = import.meta.env.VITE_MLAPI_URL;

export function SimilarPlants() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";

    const [ideallight, setIdeallight] = useState("");
    const [toleratedlight, setToleratedlight] = useState("");
    const [watering, setWatering] = useState("");
    const [climate, setClimate] = useState("");
    const [tempmax, setTempmax] = useState(26);
    const [tempmin, setTempmin] = useState(15);
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/");
    };

    const handlePredict = async () => {
        if (!ideallight || !toleratedlight || !watering || !climate) {
            setError("Please fill in all fields before predicting.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await getSimilarPlants(
                ideallight,
                toleratedlight,
                watering,
                climate,
                tempmax,
                tempmin
            );
            setResults(data.recommended_plants.slice(0, 5));
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles["similar-container"]} ${theme === "dark" ? styles.dark : ""}`}>

            <div className={styles["top-bar"]}>
                <div className={styles["left-buttons"]}>
                    <button className={styles["add-btn"]} onClick={() => navigate("/PlantInfo")}>
                        ← My Plants
                    </button>
                    <button className={styles["add-btn"]} onClick={() => navigate("/AddPlant")}>
                        + Add Plant
                    </button>
                </div>
                <div className={styles["user-area"]}>
                    <div className={styles["user-info"]}>
                        <span className={styles["user-name"]}>{displayName}</span>
                        <span className={styles["user-username"]}>@{username}</span>
                    </div>
                    <ThemeToggle />
                    <button className={styles["logout-btn"]} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className={styles["similar-content"]}>
                <h1 className={styles["page-title"]}>Plants similar to mine</h1>

                <div className={styles["form-section"]}>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>How much light does your plant currently get?</label>
                        <select className={styles["dropdown"]} value={ideallight} onChange={(e) => setIdeallight(e.target.value)}>
                            <option value="">Select…</option>
                            {LIGHT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>What's the lowest light it has handled without struggling?</label>
                        <select className={styles["dropdown"]} value={toleratedlight} onChange={(e) => setToleratedlight(e.target.value)}>
                            <option value="">Select…</option>
                            {LIGHT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>How often do you water it?</label>
                        <select className={styles["dropdown"]} value={watering} onChange={(e) => setWatering(e.target.value)}>
                            <option value="">Select…</option>
                            {WATERING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>What's the climate of the room your plant lives in?</label>
                        <select className={styles["dropdown"]} value={climate} onChange={(e) => setClimate(e.target.value)}>
                            <option value="">Select…</option>
                            {CLIMATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>What's the warmest the room gets?</label>
                        <div className={styles["slider-row"]}>
                            <input
                                type="range" min={18} max={35} step={1} value={tempmax}
                                className={styles["slider"]}
                                onChange={(e) => setTempmax(Number(e.target.value))}
                            />
                            <span className={styles["slider-value"]}>{tempmax} °C</span>
                        </div>
                    </div>

                    <div className={styles["field"]}>
                        <label className={styles["field-label"]}>What's the coolest the room gets, even in winter?</label>
                        <div className={styles["slider-row"]}>
                            <input
                                type="range" min={0} max={25} step={1} value={tempmin}
                                className={styles["slider"]}
                                onChange={(e) => setTempmin(Number(e.target.value))}
                            />
                            <span className={styles["slider-value"]}>{tempmin} °C</span>
                        </div>
                    </div>

                    <button className={styles["predict-btn"]} onClick={handlePredict}>
                        Predict
                    </button>

                </div>

                {error && <p className={styles["error-msg"]}>{error}</p>}

                {loading && <p className={styles["loading-msg"]}>Finding plants...</p>}

                {results.length > 0 && (
                    <div className={styles["results-grid"]}>
                        {results.map((name, i) => (
                            <div key={i} className={styles["plant-card"]}>
                                <h3 className={styles["plant-common"]}>{name}</h3>
                            </div>
                        ))}
                    </div>
                )}
                <div className={styles["graph-section"]}>
                    <img
                        src={`${MLAPI}/graph/plot`}
                        alt="ML plant graph"
                        className={styles["graph-img"]}
                    />
                </div>

            </div>
        </div>
    );
}

export default SimilarPlants;