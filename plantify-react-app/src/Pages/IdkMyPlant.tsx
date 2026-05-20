import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTheme } from "../theme/ThemeContext";
import { ThemeToggle } from "../theme/ThemeToggle";
import styles from "./Stylesheets/IdkMyPlant.module.css";

const SOIL_TYPES = ["Clay", "Loamy", "Sandy", "Peaty", "Silty", "Chalky"] as const;
type SoilType = (typeof SOIL_TYPES)[number];

interface PlantPreset {
    emoji: string;
    name: string;
    optimalTemperature: number;
    optimalAirHumidity: number;
    optimalSoilHumidity: number;
    optimalLightIntensity: number;
}

const PLANT_PRESETS: PlantPreset[] = [
    { emoji: "🌵", name: "Cactus",         optimalTemperature: 28, optimalAirHumidity: 20, optimalSoilHumidity: 15, optimalLightIntensity: 95 },
    { emoji: "🌿", name: "Monstera",        optimalTemperature: 22, optimalAirHumidity: 65, optimalSoilHumidity: 55, optimalLightIntensity: 60 },
    { emoji: "🪴", name: "Pothos",          optimalTemperature: 21, optimalAirHumidity: 50, optimalSoilHumidity: 45, optimalLightIntensity: 40 },
    { emoji: "🌸", name: "Peace Lily",      optimalTemperature: 20, optimalAirHumidity: 70, optimalSoilHumidity: 65, optimalLightIntensity: 35 },
    { emoji: "🌱", name: "Snake Plant",     optimalTemperature: 23, optimalAirHumidity: 40, optimalSoilHumidity: 30, optimalLightIntensity: 50 },
    { emoji: "🌺", name: "Orchid",          optimalTemperature: 19, optimalAirHumidity: 75, optimalSoilHumidity: 60, optimalLightIntensity: 55 },
    { emoji: "🍃", name: "Fiddle Leaf Fig", optimalTemperature: 22, optimalAirHumidity: 60, optimalSoilHumidity: 50, optimalLightIntensity: 80 },
];

interface FormState {
    height: number;
    leafCount: number;
    newGrowthCount: number;
    wateringAmount: number;
    wateringFrequency: number;
    soilType: SoilType | null;
}

interface IdentifyResult {
    speciesName: string;
    confidence: number;
    preset: PlantPreset;
}

export function IdkMyPlant() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";

    const [form, setForm] = useState<FormState>({
        height: 15,
        leafCount: 10,
        newGrowthCount: 2,
        wateringAmount: 150,
        wateringFrequency: 2,
        soilType: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<IdentifyResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/");
    };

    const handleSlider = (key: keyof FormState, value: number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSoil = (soil: SoilType) => {
        setForm((prev) => ({ ...prev, soilType: prev.soilType === soil ? null : soil }));
    };

    const handleIdentify = async () => {
        if (!form.soilType) {
            setError("Please select a soil type.");
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);

        try {
            const speciesNames = PLANT_PRESETS.map((p) => p.name).join(", ");

            const prompt = `You are a botanist AI. Based on these plant characteristics, identify the most likely houseplant species.
You MUST choose exactly one species from this list: ${speciesNames}.

Plant characteristics:
- Height: ${form.height} cm
- Leaf count: ${form.leafCount}
- New leaves per month: ${form.newGrowthCount}
- Watering amount: ${form.wateringAmount} ml
- Watering frequency: every ${form.wateringFrequency} day(s)
- Soil type: ${form.soilType}

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "speciesName": "exact species name from the list above",
  "confidence": number between 0 and 100
}`;

            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 200,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            const data = await response.json();
            const text = data.content.map((i: { type: string; text?: string }) => i.text || "").join("");
            const clean = text.replace(/```json|```/g, "").trim();
            const parsed: { speciesName: string; confidence: number } = JSON.parse(clean);

            // Lookup preset by name — AI only picks the name, values come from our list
            const preset = PLANT_PRESETS.find(
                (p) => p.name.toLowerCase() === parsed.speciesName.toLowerCase()
            );

            if (!preset) {
                setError("Could not match species to our database. Please try again.");
                return;
            }

            setResult({ speciesName: parsed.speciesName, confidence: parsed.confidence, preset });
        } catch {
            setError("Failed to identify plant. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseValues = () => {
        if (!result) return;
        navigate("/AddPlant", {
            state: {
                optimalTemperature: result.preset.optimalTemperature,
                optimalAirHumidity: result.preset.optimalAirHumidity,
                optimalSoilHumidity: result.preset.optimalSoilHumidity,
                optimalLightIntensity: result.preset.optimalLightIntensity,
                name: result.preset.name,
            },
        });
    };

    return (
        <div className={`${styles.container} ${theme === "dark" ? styles.dark : ""}`}>
            {/* Top bar */}
            <div className={styles.topBar}>
                <div className={styles.leftButtons}>
                    <button className={styles.backBtn} onClick={() => navigate("/AddPlant")}>
                        ← Back
                    </button>
                </div>
                <div className={styles.userArea}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{displayName}</span>
                        <span className={styles.userUsername}>@{username}</span>
                    </div>
                    <ThemeToggle />
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>🌿 Identify My Plant</h1>
                <p className={styles.pageSubtitle}>
                    Describe your plant and we'll find its optimal values
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.formColumn}>

                    {/* Height */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>📏 Approximate Height</div>
                        <div className={styles.cardTitle}>How tall is your plant?</div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                min={5}
                                max={30}
                                value={form.height}
                                onChange={(e) => handleSlider("height", Number(e.target.value))}
                                className={styles.slider}
                            />
                            <span className={styles.sliderValue}>{form.height} cm</span>
                        </div>
                        <div className={styles.sliderBounds}><span>5 cm</span><span>30 cm</span></div>
                    </div>

                    {/* Leaf Count */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>🍃 Leaf Count</div>
                        <div className={styles.cardTitle}>How many leaves does it have?</div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                min={0}
                                max={30}
                                value={form.leafCount}
                                onChange={(e) => handleSlider("leafCount", Number(e.target.value))}
                                className={styles.slider}
                            />
                            <span className={styles.sliderValue}>{form.leafCount}</span>
                        </div>
                        <div className={styles.sliderBounds}><span>0</span><span>30</span></div>
                    </div>

                    {/* New Growth */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>📈 Monthly New Growth <span className={styles.badge}>0 – 6</span></div>
                        <div className={styles.cardTitle}>New leaves grown this month?</div>
                        <div className={styles.chipGrid}>
                            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                                <button
                                    key={n}
                                    className={`${styles.chip} ${form.newGrowthCount === n ? styles.chipActive : ""}`}
                                    onClick={() => setForm((p) => ({ ...p, newGrowthCount: n }))}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Watering Amount */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>💧 Watering Amount</div>
                        <div className={styles.cardTitle}>How much water per session (ml)?</div>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                min={10}
                                max={500}
                                step={10}
                                value={form.wateringAmount}
                                onChange={(e) => handleSlider("wateringAmount", Number(e.target.value))}
                                className={styles.slider}
                            />
                            <span className={styles.sliderValue}>{form.wateringAmount} ml</span>
                        </div>
                        <div className={styles.sliderBounds}><span>10 ml</span><span>500 ml</span></div>
                    </div>

                    {/* Watering Frequency */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>📅 Watering Frequency</div>
                        <div className={styles.cardTitle}>Every how many days do you water?</div>
                        <div className={styles.chipGrid}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    className={`${styles.chip} ${form.wateringFrequency === n ? styles.chipActive : ""}`}
                                    onClick={() => setForm((p) => ({ ...p, wateringFrequency: n }))}
                                >
                                    {n}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Soil Type */}
                    <div className={styles.card}>
                        <div className={styles.cardLabel}>🪨 Soil Type</div>
                        <div className={styles.cardTitle}>What kind of soil does it have?</div>
                        <div className={styles.soilGrid}>
                            {SOIL_TYPES.map((soil) => (
                                <button
                                    key={soil}
                                    className={`${styles.soilBtn} ${form.soilType === soil ? styles.soilBtnActive : ""}`}
                                    onClick={() => handleSoil(soil)}
                                >
                                    {soil}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className={styles.errorText}>{error}</p>}

                    <button
                        className={styles.identifyBtn}
                        onClick={handleIdentify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingDots}>Identifying<span>.</span><span>.</span><span>.</span></span>
                        ) : (
                            "✨ Identify & Get Optimal Values"
                        )}
                    </button>
                </div>

                {/* Result panel */}
                {result && (
                    <div className={styles.resultPanel}>
                        <div className={styles.resultHeader}>
                            <div className={styles.resultEmoji}>{result.preset.emoji}</div>
                            <div className={styles.resultSpecies}>{result.speciesName}</div>
                            <div className={styles.resultConfidence}>
                                <span className={styles.confidenceBar}>
                                    <span
                                        className={styles.confidenceFill}
                                        style={{ width: `${result.confidence}%` }}
                                    />
                                </span>
                                <span className={styles.confidenceText}>{result.confidence}% match</span>
                            </div>
                        </div>

                        <div className={styles.resultGrid}>
                            {[
                                { label: "Temperature",    value: result.preset.optimalTemperature,    unit: "°C", icon: "🌡️" },
                                { label: "Air Humidity",   value: result.preset.optimalAirHumidity,    unit: "%",  icon: "💨" },
                                { label: "Soil Humidity",  value: result.preset.optimalSoilHumidity,   unit: "%",  icon: "💧" },
                                { label: "Light Intensity",value: result.preset.optimalLightIntensity, unit: "%",  icon: "☀️" },
                            ].map((item) => (
                                <div key={item.label} className={styles.resultCard}>
                                    <div className={styles.resultIcon}>{item.icon}</div>
                                    <div className={styles.resultLabel}>{item.label}</div>
                                    <div className={styles.resultValue}>
                                        {item.value}<span className={styles.resultUnit}>{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className={styles.useBtn} onClick={handleUseValues}>
                            Use These Values →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default IdkMyPlant;