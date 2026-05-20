import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTheme } from "../theme/ThemeContext";
import { ThemeToggle } from "../theme/ThemeToggle";
import { createPlant, getPlant, updatePlant } from "../api/Plants/plantApi";
import { getErrorMessage } from "../api/authApi";
import type { SensorData } from "../api/Plants/plantTypes";
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

const READINGS_REQUIRED = 7;

// ── Step 1: fill form & add plant ──────────────────────────────────────────
interface FormState {
    mac: string;
    plantName: string;
    height: number;
    leafCount: number;
    newGrowthCount: number;
    wateringAmount: number;
    wateringFrequency: number;
    soilType: SoilType | null;
    optimalTemperature: number;
    optimalAirHumidity: number;
    optimalSoilHumidity: number;
    optimalLightIntensity: number;
}

type Step = "form" | "waiting" | "diagnosing" | "done";

interface DiagnosisResult {
    preset: PlantPreset;
    confidence: number;
}

function avg(readings: SensorData[], key: keyof SensorData): number {
    const vals = readings
        .map((r) => r[key] as number | undefined)
        .filter((v): v is number => v != null);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function IdkMyPlant() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;
    const displayName = user?.name || user?.username || "User";
    const username = user?.username || "unknown";

    const [step, setStep] = useState<Step>("form");
    const [form, setForm] = useState<FormState>({
        mac: "",
        plantName: "",
        height: 15,
        leafCount: 10,
        newGrowthCount: 2,
        wateringAmount: 150,
        wateringFrequency: 2,
        soilType: null,
        optimalTemperature: 20,
        optimalAirHumidity: 50,
        optimalSoilHumidity: 40,
        optimalLightIntensity: 50,
    });

    const [plantMac, setPlantMac] = useState<string>("");
    const [readingCount, setReadingCount] = useState<number>(0);
    const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
        const formatted = raw.match(/.{1,2}/g)?.join(":") ?? raw;
        setForm((prev) => ({ ...prev, mac: formatted.slice(0, 17) }));
    };

    const handleSlider = (key: keyof FormState, value: number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSoil = (soil: SoilType) => {
        setForm((prev) => ({ ...prev, soilType: prev.soilType === soil ? null : soil }));
    };

    // ── Step 1: Add plant with user-provided optimal values ──────────────────
    const handleAddPlant = async () => {
        if (!form.mac || !form.plantName) {
            setError("Please enter a MAC address and plant name.");
            return;
        }
        if (!form.soilType) {
            setError("Please select a soil type.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await createPlant({
                mac: form.mac,
                name: form.plantName,
                username,
                optimalTemperature: form.optimalTemperature,
                optimalAirHumidity: form.optimalAirHumidity,
                optimalSoilHumidity: form.optimalSoilHumidity,
                optimalLightIntensity: form.optimalLightIntensity,
            });
            setPlantMac(form.mac);
            setStep("waiting");
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Check how many readings we have so far ───────────────────────
    const handleCheckReadings = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const plant = await getPlant(plantMac, READINGS_REQUIRED, 0);
            const readings = plant.previousSensorData ?? [];
            setReadingCount(readings.length);

            if (readings.length >= READINGS_REQUIRED) {
                await runDiagnosis(readings);
            }
        } catch (err) {
            const { message } = getErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 3: Diagnose using Claude ────────────────────────────────────────
    const runDiagnosis = async (readings: SensorData[]) => {
        setStep("diagnosing");

        const avgTemp  = avg(readings, "temperature");
        const avgAir   = avg(readings, "airHumidity");
        const avgSoil  = avg(readings, "soilHumidity");
        const avgLight = avg(readings, "lightIntensity");

        const speciesNames = PLANT_PRESETS.map((p) => p.name).join(", ");

        const prompt = `You are a botanist AI. Based on sensor data and plant characteristics, identify the most likely houseplant species.
You MUST choose exactly one from this list: ${speciesNames}.

Sensor averages (${readings.length} readings):
- Temperature: ${avgTemp}°C
- Air humidity: ${avgAir}%
- Soil humidity: ${avgSoil}%
- Light intensity: ${avgLight}%

Plant characteristics provided by user:
- Height: ${form.height} cm
- Leaf count: ${form.leafCount}
- New leaves per month: ${form.newGrowthCount}
- Watering amount: ${form.wateringAmount} ml
- Watering every: ${form.wateringFrequency} day(s)
- Soil type: ${form.soilType}

Respond ONLY with valid JSON, no markdown:
{"speciesName": "exact name from list", "confidence": number 0-100}`;

        try {
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
            const text = data.content
                .map((i: { type: string; text?: string }) => i.text || "")
                .join("");
            const clean = text.replace(/```json|```/g, "").trim();
            const parsed: { speciesName: string; confidence: number } = JSON.parse(clean);

            const preset = PLANT_PRESETS.find(
                (p) => p.name.toLowerCase() === parsed.speciesName.toLowerCase()
            );
            if (!preset) throw new Error("Species not matched");

            // Update plant with diagnosed optimal values
            await updatePlant(plantMac, {
                mac: plantMac,
                name: form.plantName,
                username,
                optimalTemperature: preset.optimalTemperature,
                optimalAirHumidity: preset.optimalAirHumidity,
                optimalSoilHumidity: preset.optimalSoilHumidity,
                optimalLightIntensity: preset.optimalLightIntensity,
            });

            setDiagnosis({ preset, confidence: parsed.confidence });
            setStep("done");
        } catch {
            setError("Diagnosis failed. Please try again.");
            setStep("waiting");
        }
    };

    const handleLogout = () => {
        Cookies.remove("user");
        navigate("/");
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
                    <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* ── STEP: FORM ── */}
            {step === "form" && (
                <>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>🌿 I Don't Know My Plant</h1>
                        <p className={styles.pageSubtitle}>
                            Add your plant with your best guesses — we'll identify it after {READINGS_REQUIRED} sensor readings
                        </p>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.formColumn}>

                            {/* MAC + Name */}
                            <div className={styles.card}>
                                <div className={styles.cardLabel}> Device & Name</div>
                                <div className={styles.twoCol}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>MAC Address</label>
                                        <input
                                            className={styles.fieldInput}
                                            value={form.mac}
                                            onChange={handleMacChange}
                                            placeholder="AA:BB:CC:DD:EE"
                                            maxLength={17}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Plant Name</label>
                                        <input
                                            className={styles.fieldInput}
                                            value={form.plantName}
                                            onChange={(e) => setForm((p) => ({ ...p, plantName: e.target.value }))}
                                            placeholder="e.g. My Green Friend"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Your best guess for optimal values */}
                            <div className={styles.card}>
                                <div className={styles.cardLabel}>Your Best Guess — Optimal Values</div>
                                <p className={styles.cardHint}>These will be used until we diagnose your plant</p>
                                <div className={styles.optimalGrid}>
                                    {[
                                        { key: "optimalTemperature" as const, label: "Temperature", unit: "°C", min: 0, max: 50 },
                                        { key: "optimalAirHumidity" as const, label: "Air Humidity", unit: "%", min: 0, max: 100 },
                                        { key: "optimalSoilHumidity" as const, label: "Soil Humidity", unit: "%", min: 0, max: 100 },
                                        { key: "optimalLightIntensity" as const, label: "Light Intensity", unit: "%", min: 0, max: 100 },
                                    ].map((field) => (
                                        <div key={field.key} className={styles.optimalBox}>
                                            <div className={styles.optimalLabel}>{field.label}</div>
                                            <div className={styles.optimalValue}>
                                                {form[field.key]}<span className={styles.optimalUnit}>{field.unit}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={field.min}
                                                max={field.max}
                                                value={form[field.key] as number}
                                                onChange={(e) => handleSlider(field.key, Number(e.target.value))}
                                                className={styles.slider}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Plant description */}
                            <div className={styles.card}>
                                <div className={styles.cardLabel}>Height <span className={styles.badge}>5–30 cm</span></div>
                                <div className={styles.sliderRow}>
                                    <input type="range" min={5} max={30} value={form.height}
                                           onChange={(e) => handleSlider("height", Number(e.target.value))}
                                           className={styles.slider} />
                                    <span className={styles.sliderValue}>{form.height} cm</span>
                                </div>
                                <div className={styles.sliderBounds}><span>5 cm</span><span>30 cm</span></div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardLabel}> Leaf Count <span className={styles.badge}>0–30</span></div>
                                <div className={styles.sliderRow}>
                                    <input type="range" min={0} max={30} value={form.leafCount}
                                           onChange={(e) => handleSlider("leafCount", Number(e.target.value))}
                                           className={styles.slider} />
                                    <span className={styles.sliderValue}>{form.leafCount}</span>
                                </div>
                                <div className={styles.sliderBounds}><span>0</span><span>30</span></div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardLabel}>New Leaves This Month <span className={styles.badge}>0–6</span></div>
                                <div className={styles.chipGrid}>
                                    {[0,1,2,3,4,5,6].map((n) => (
                                        <button key={n}
                                                className={`${styles.chip} ${form.newGrowthCount === n ? styles.chipActive : ""}`}
                                                onClick={() => setForm((p) => ({ ...p, newGrowthCount: n }))}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardLabel}> Watering Amount</div>
                                <div className={styles.sliderRow}>
                                    <input type="range" min={10} max={500} step={10} value={form.wateringAmount}
                                           onChange={(e) => handleSlider("wateringAmount", Number(e.target.value))}
                                           className={styles.slider} />
                                    <span className={styles.sliderValue}>{form.wateringAmount} ml</span>
                                </div>
                                <div className={styles.sliderBounds}><span>10 ml</span><span>500 ml</span></div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardLabel}> Watering Every</div>
                                <div className={styles.chipGrid}>
                                    {[1,2,3,4,5].map((n) => (
                                        <button key={n}
                                                className={`${styles.chip} ${form.wateringFrequency === n ? styles.chipActive : ""}`}
                                                onClick={() => setForm((p) => ({ ...p, wateringFrequency: n }))}>
                                            {n}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardLabel}> Soil Type</div>
                                <div className={styles.soilGrid}>
                                    {SOIL_TYPES.map((soil) => (
                                        <button key={soil}
                                                className={`${styles.soilBtn} ${form.soilType === soil ? styles.soilBtnActive : ""}`}
                                                onClick={() => handleSoil(soil)}>
                                            {soil}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && <p className={styles.errorText}>{error}</p>}

                            <button className={styles.identifyBtn} onClick={handleAddPlant} disabled={isLoading}>
                                {isLoading ? "Adding plant..." : " Add Plant & Start Monitoring"}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── STEP: WAITING FOR READINGS ── */}
            {step === "waiting" && (
                <div className={styles.waitingWrapper}>
                    <div className={styles.waitingCard}>
                        <h2 className={styles.waitingTitle}>Plant added!</h2>
                        <p className={styles.waitingSubtitle}>
                            We need <strong>{READINGS_REQUIRED} sensor readings</strong> to diagnose your plant.
                        </p>

                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${Math.min(100, (readingCount / READINGS_REQUIRED) * 100)}%` }}
                            />
                        </div>
                        <p className={styles.progressText}>
                            {readingCount} / {READINGS_REQUIRED} readings collected
                        </p>

                        {readingCount < READINGS_REQUIRED && (
                            <p className={styles.waitingHint}>
                                Keep your sensor running — come back to check progress
                            </p>
                        )}

                        {error && <p className={styles.errorText}>{error}</p>}

                        <button className={styles.identifyBtn} onClick={handleCheckReadings} disabled={isLoading}>
                            {isLoading ? "Checking..." : "Check Progress"}
                        </button>

                        <button className={styles.secondaryBtn} onClick={() => navigate("/PlantInfo")}>
                            Go to My Plants
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP: DIAGNOSING ── */}
            {step === "diagnosing" && (
                <div className={styles.waitingWrapper}>
                    <div className={styles.waitingCard}>
                        <h2 className={styles.waitingTitle}>Analyzing your plant...</h2>
                        <p className={styles.waitingSubtitle}>
                            Claude is processing {READINGS_REQUIRED} sensor readings
                        </p>
                        <div className={styles.loadingBar}>
                            <div className={styles.loadingBarFill} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP: DONE ── */}
            {step === "done" && diagnosis && (
                <div className={styles.waitingWrapper}>
                    <div className={styles.waitingCard}>
                        <div className={styles.waitingEmoji}>{diagnosis.preset.emoji}</div>
                        <h2 className={styles.waitingTitle}>Diagnosis complete!</h2>
                        <p className={styles.resultSpecies}>{diagnosis.preset.name}</p>

                        <div className={styles.confidenceRow}>
                            <div className={styles.confidenceBar}>
                                <div className={styles.confidenceFill} style={{ width: `${diagnosis.confidence}%` }} />
                            </div>
                            <span className={styles.confidenceText}>{diagnosis.confidence}% match</span>
                        </div>

                        <div className={styles.resultGrid}>
                            {[
                                { label: "Temperature",    value: diagnosis.preset.optimalTemperature,    unit: "°C"},
                                { label: "Air Humidity",   value: diagnosis.preset.optimalAirHumidity,    unit: "%"},
                                { label: "Soil Humidity",  value: diagnosis.preset.optimalSoilHumidity,   unit: "%" },
                                { label: "Light Intensity",value: diagnosis.preset.optimalLightIntensity, unit: "%" },
                            ].map((item) => (
                                <div key={item.label} className={styles.resultCard}>
                                    <div className={styles.resultLabel}>{item.label}</div>
                                    <div className={styles.resultValue}>
                                        {item.value}<span className={styles.resultUnit}>{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className={styles.waitingHint}>
                            Optimal values have been updated automatically
                        </p>

                        <button className={styles.identifyBtn} onClick={() => navigate("/PlantInfo")}>
                            Go to My Plants →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IdkMyPlant;