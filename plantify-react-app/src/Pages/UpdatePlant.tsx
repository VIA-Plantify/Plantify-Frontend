import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { updatePlant, getPlant, getPlants } from "../api/Plants/plantApi";
import { getErrorMessage } from "../api/authApi";
import styles from "./Stylesheets/AddPlant.module.css";
import plantImg from "../assets/plant.placeholder.png";
import type { Plant } from "../api/Plants/plantTypes";
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';

const fieldLimits: Record<string, number> = {
    optimalTemperature: 100,
    optimalAirHumidity: 100,
    optimalSoilHumidity: 100,
    optimalLightIntensity: 1024,
};

export function UpdatePlant() {
    const navigate = useNavigate();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";
    const { theme } = useTheme();

    const [allPlants, setAllPlants] = useState<Plant[]>([]);
    const [selectedMac, setSelectedMac] = useState<string>("");
    const [form, setForm] = useState({
        name: "",
        optimalTemperature: "",
        optimalAirHumidity: "",
        optimalSoilHumidity: "",
        optimalLightIntensity: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const inputRefs = {
        optimalTemperature: useRef<HTMLInputElement>(null),
        optimalSoilHumidity: useRef<HTMLInputElement>(null),
        optimalAirHumidity: useRef<HTMLInputElement>(null),
        optimalLightIntensity: useRef<HTMLInputElement>(null),
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const plants = await getPlants();
                setAllPlants(plants);
                if (plants.length > 0) setSelectedMac(plants[0].mac);
            } catch (err) {
                const { message } = getErrorMessage(err);
                setError(message);
            } finally {
                setIsFetching(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (!selectedMac) return;
        const fetchOne = async () => {
            try {
                const plant = await getPlant(selectedMac);
                setForm({
                    name: plant.name,
                    optimalTemperature: String(plant.optimalTemperature ?? ""),
                    optimalAirHumidity: String(plant.optimalAirHumidity ?? ""),
                    optimalSoilHumidity: String(plant.optimalSoilHumidity ?? ""),
                    optimalLightIntensity: String(plant.optimalLightIntensity ?? ""),
                });
            } catch (err) {
                const { message } = getErrorMessage(err);
                setError(message);
            }
        };
        fetchOne();
    }, [selectedMac]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === "number") {
            if (value === "") {
                setForm((prev) => ({ ...prev, [name]: "" }));
                return;
            }
            const num = parseFloat(value);
            const max = fieldLimits[name] ?? 100;
            const clamped = Math.min(max, Math.max(0, num));
            setForm((prev) => ({ ...prev, [name]: String(clamped) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await updatePlant(selectedMac, {
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
        max: number;
    }[] = [
        { label: "Temperature",    name: "optimalTemperature",    unit: "°C",  placeholder: "0–100",  max: 100  },
        { label: "Soil Humidity",  name: "optimalSoilHumidity",   unit: "%",   placeholder: "0–100",  max: 100  },
        { label: "Air Humidity",   name: "optimalAirHumidity",    unit: "%",   placeholder: "0–100",  max: 100  },
        { label: "Light Intensity",name: "optimalLightIntensity", unit: "", placeholder: "0–1024", max: 1024 },
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
                max={field.max}
            />
        </div>
    );

    if (isFetching) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

    return (
        <div className={`${styles["plant-info-container"]} ${theme === 'dark' ? styles.dark : ''}`}>

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

            <div className={styles["plant-header"]}>
                <div className={styles["header-field"]}>
                    <label className={styles["header-label"]}>Select Plant</label>
                    <select
                        className={styles["header-input"]}
                        value={selectedMac}
                        onChange={(e) => setSelectedMac(e.target.value)}
                        style={{ cursor: "pointer" }}
                    >
                        {allPlants.map((p) => (
                            <option key={p.mac} value={p.mac}>
                                {p.name} ({p.mac})
                            </option>
                        ))}
                    </select>
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
                    disabled={isLoading || !form.name || !selectedMac}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

export default UpdatePlant;