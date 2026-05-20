import { useRef, useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import { createPlant } from "../api/Plants/plantApi";
import { getErrorMessage } from "../api/authApi";
import styles from "./Stylesheets/AddPlant.module.css";
import plantImg from "../assets/plant.placeholder.png";
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';


interface PlantPreset {
    emoji: string;
    name: string;
    optimalTemperature: number;
    optimalAirHumidity: number;
    optimalSoilHumidity: number;
    optimalLightIntensity: number;
}

const PLANT_PRESETS: PlantPreset[] = [
    {
        emoji: "🌵",
        name: "Cactus",
        optimalTemperature: 28,
        optimalAirHumidity: 20,
        optimalSoilHumidity: 15,
        optimalLightIntensity: 95,

    },
    {
        emoji: "🌿",
        name: "Monstera",
        optimalTemperature: 22,
        optimalAirHumidity: 65,
        optimalSoilHumidity: 55,
        optimalLightIntensity: 60,

    },
    {
        emoji: "🪴",
        name: "Pothos",
        optimalTemperature: 21,
        optimalAirHumidity: 50,
        optimalSoilHumidity: 45,
        optimalLightIntensity: 40,

    },
    {
        emoji: "🌸",
        name: "Peace Lily",
        optimalTemperature: 20,
        optimalAirHumidity: 70,
        optimalSoilHumidity: 65,
        optimalLightIntensity: 35,

    },
    {
        emoji: "🌱",
        name: "Snake Plant",
        optimalTemperature: 23,
        optimalAirHumidity: 40,
        optimalSoilHumidity: 30,
        optimalLightIntensity: 50,

    },
    {
        emoji: "🌺",
        name: "Orchid",
        optimalTemperature: 19,
        optimalAirHumidity: 75,
        optimalSoilHumidity: 60,
        optimalLightIntensity: 55,

    },
    {
        emoji: "🍃",
        name: "Fiddle Leaf Fig",
        optimalTemperature: 22,
        optimalAirHumidity: 60,
        optimalSoilHumidity: 50,
        optimalLightIntensity: 80,

    },
];

export function AddPlant() {
    const navigate = useNavigate();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";
    const { theme } = useTheme();

    const [form, setForm] = useState({
        mac: "",
        name: "",
        optimalTemperature: "",
        optimalAirHumidity: "",
        optimalSoilHumidity: "",
        optimalLightIntensity: "",

    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const inputRefs = {
        optimalTemperature: useRef<HTMLInputElement>(null),
        optimalSoilHumidity: useRef<HTMLInputElement>(null),
        optimalAirHumidity: useRef<HTMLInputElement>(null),
        optimalLightIntensity: useRef<HTMLInputElement>(null),
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === "number") {
            if (value === "") {
                setForm((prev) => ({ ...prev, [name]: "" }));
                return;
            }
            const num = parseFloat(value);
            const clamped = Math.min(1024, Math.max(0, num));
            setForm((prev) => ({ ...prev, [name]: String(clamped) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
        const formatted = raw.match(/.{1,2}/g)?.join(":") ?? raw;
        setForm((prev) => ({ ...prev, mac: formatted.slice(0, 17) }));
    };

    const applyPreset = (preset: PlantPreset) => {
        setForm((prev) => ({
            ...prev,
            name: preset.name,
            optimalTemperature: String(preset.optimalTemperature),
            optimalAirHumidity: String(preset.optimalAirHumidity),
            optimalSoilHumidity: String(preset.optimalSoilHumidity),
            optimalLightIntensity: String(preset.optimalLightIntensity),
        }));
        setDropdownOpen(false);
    };

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await createPlant({
                mac: form.mac,
                name: form.name,
                username,
                optimalTemperature: form.optimalTemperature ? parseFloat(form.optimalTemperature) : undefined,
                optimalAirHumidity: form.optimalAirHumidity ? parseFloat(form.optimalAirHumidity) : undefined,
                optimalSoilHumidity: form.optimalSoilHumidity ? parseFloat(form.optimalSoilHumidity) : undefined,
                optimalLightIntensity: form.optimalLightIntensity ? parseFloat(form.optimalLightIntensity) : undefined,
            });
            navigate("/PlantInfo");
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

    const fields: {
        label: string;
        name: keyof typeof inputRefs;
        unit?: string;
        placeholder?: string;
    }[] = [
        { label: "Temperature", name: "optimalTemperature", unit: "°C", placeholder: "0–100" },
        { label: "Soil Humidity", name: "optimalSoilHumidity", unit: "%", placeholder: "0–100" },
        { label: "Air Humidity", name: "optimalAirHumidity", unit: "%", placeholder: "0–100" },
        { label: "Light Intensity", name: "optimalLightIntensity", unit: "", placeholder: "0–1024" },
    ];

    const leftFields = fields.slice(0, 2);
    const rightFields = fields.slice(2, 4);

    const renderBox = (field: typeof fields[number]) => (
        <div
            key={field.name}
            className={styles.box}
            onClick={() => inputRefs[field.name].current?.focus()}
        >
            <div className={styles["box-label"]}>
                {field.label} {field.unit && <span className={styles["box-unit"]}>{field.unit}</span>}
            </div>
            <input
                ref={inputRefs[field.name]}
                className={styles["box-input"]}
                type="number"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                min={0}
                max={1024}
            />
        </div>
    );

    return (
        <div className={`${styles["plant-info-container"]} ${theme === 'dark' ? styles.dark : ''}`} onClick={() => dropdownOpen && setDropdownOpen(false)}>


            <div className={styles["top-bar"]}>
                <div className={styles["left-buttons"]}>
                    <button className={styles["back-btn"]} onClick={() => navigate("/PlantInfo")}>
                        ← Back
                    </button>
                </div>
                <div className={styles["user-area"]}>
                    <div className={styles["user-info"]}>
                        <span className={styles["user-name"]}>{displayName}</span>
                        <span className={styles["user-username"]}>@{username}</span>
                    </div>
                    <ThemeToggle/>
                    <button className={styles["logout-btn"]} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>


            <div className={styles["preset-section"]} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles["preset-trigger"]}
                    onClick={() => setDropdownOpen((o) => !o)}
                >
                    🌿 Choose a plant type
                    <span className={`${styles["preset-arrow"]} ${dropdownOpen ? styles["preset-arrow-open"] : ""}`}>▾</span>
                </button>

                {dropdownOpen && (
                    <div className={styles["preset-dropdown"]}>
                        {PLANT_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                className={styles["preset-item"]}
                                onClick={() => applyPreset(preset)}
                            >
                                <span className={styles["preset-emoji"]}>{preset.emoji}</span>
                                <div className={styles["preset-info"]}>
                                    <span className={styles["preset-name"]}>{preset.name}</span>
                                    <span className={styles["preset-stats"]}>
                                        {preset.optimalTemperature}°C · {preset.optimalSoilHumidity}% soil · {preset.optimalLightIntensity}% light
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>


            <div className={styles["plant-header"]}>
                <div className={styles["header-field"]}>
                    <label className={styles["header-label"]}>MAC Address</label>
                    <input
                        className={styles["header-input"]}
                        name="mac"
                        value={form.mac}
                        onChange={handleMacChange}
                        placeholder="AA:BB:CC:DD:EE:FF"
                        maxLength={17}
                    />
                </div>
                <div className={styles["header-field"]}>
                    <label className={styles["header-label"]}>Plant Name</label>
                    <input
                        className={styles["header-input"]}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. My Fern"
                    />
                </div>
            </div>


            <div className={styles["plant-info-content"]}>
                <div className={styles["left-boxes"]}>{leftFields.map(renderBox)}</div>
                <div className={styles["center-image"]}>
                    <img className={styles["plant-image"]} src={plantImg} alt="Plant" />
                </div>
                <div className={styles["right-boxes"]}>{rightFields.map(renderBox)}</div>
            </div>


            <div className={styles["bottom-section"]}>
                {error && <p className={styles["error-text"]}>{error}</p>}

                <button
                    className={styles["submit-btn"]}
                    onClick={handleSubmit}
                    disabled={isLoading || !form.mac || !form.name}
                >
                    {isLoading ? "Adding..." : "Add Plant"}
                </button>
            </div>
            <p><Link className={styles.link} to="/IdkMyPlant">I dont know my plant optimal values</Link></p>
        </div>
    );
}

export default AddPlant;