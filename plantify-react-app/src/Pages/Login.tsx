import {useEffect, useRef, useState} from 'react';
import { Link, useNavigate } from "react-router-dom"
import logo from '../assets/plantifylogotransp.png'
import styles from "./Stylesheets/Login.module.css";
import Cookies from 'js-cookie';
import {getErrorMessage, login} from "../api/authApi";

export function Login() {
    const navigate = useNavigate();
    console.log("Initial render - checking cookies:", {
        token: Cookies.get('token'),
        user: Cookies.get('user')
    });
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userData, setUserData] = useState<{username: string; email: string} | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    const clearFields = () => {
        setEmailOrUsername("");
        setPassword("");
        setUserData(null);
    }

    useEffect(() => {
        const userStr = Cookies.get('user');

        if (userStr) {
            try {
                const decoded = decodeURIComponent(userStr);
                const user = JSON.parse(decoded);
                setUserData(user);
                console.log("Session restored:", user);
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        interface Wave {
            radius: number;
            opacity: number;
            maxRadius: number;
            centerX: number;
            centerY: number;
        }

        let waves: Wave[] = [];
        const getLogoPosition = (): { x: number; y: number } => {
            const logoElement = document.querySelector(`.${styles.logo}`);
            if (logoElement && canvas) {
                const logoRect = logoElement.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                return {
                    x: logoRect.left + logoRect.width / 2 - canvasRect.left,
                    y: logoRect.top + logoRect.height * 0.7 - canvasRect.top
                };
            }
            return { x: canvas.width / 2, y: canvas.height / 2 };
        };

        const getMaxRadius = (centerX: number, centerY: number) => {
            const cornerX = Math.max(centerX, canvas.width - centerX);
            const cornerY = Math.max(centerY, canvas.height - centerY);
            return Math.sqrt(cornerX * cornerX + cornerY * cornerY);
        };

        const addWave = () => {
            const logoPos = getLogoPosition();
            waves.push({
                radius: 8,
                opacity: 0.55,
                maxRadius: getMaxRadius(logoPos.x, logoPos.y) + 60,
                centerX: logoPos.x,
                centerY: logoPos.y
            });
        };


        let frameCounter = 0;
        const framesBetweenWaves = 280;

        let animationId: number;

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < waves.length; i++) {
                const wave = waves[i];

                wave.radius += 0.5;
                wave.opacity = 0.5 * (1 - wave.radius / wave.maxRadius);

                ctx.beginPath();
                ctx.arc(wave.centerX, wave.centerY, wave.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(70, 210, 65, ${Math.max(0, wave.opacity)})`;
                ctx.lineWidth = 6;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(wave.centerX, wave.centerY, wave.radius - 4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(90, 230, 85, ${Math.max(0, wave.opacity - 0.08)})`;
                ctx.lineWidth = 4;
                ctx.stroke();

                if (wave.radius > 25) {
                    ctx.beginPath();
                    ctx.arc(wave.centerX, wave.centerY, wave.radius - 8, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(60, 190, 55, ${Math.max(0, wave.opacity - 0.12)})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            waves = waves.filter(wave =>
                wave.radius < wave.maxRadius && wave.opacity > 0.03
            );

            frameCounter++;
            if (frameCounter >= framesBetweenWaves) {
                frameCounter = 0;
                addWave();
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResizeAndReset = () => {
            resize();
            waves = [];
            addWave();
            frameCounter = 0;
        };
        window.addEventListener('resize', handleResizeAndReset);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('resize', handleResizeAndReset);
            cancelAnimationFrame(animationId);
        };

    }, []);
    const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
        try {
            const isEmail=emailOrUsername.includes("@")
            const response = await login({
                email: isEmail ? emailOrUsername : "",
            username : !isEmail ? emailOrUsername: "",
            password});

            const userInfo = {
                username: response.data.username || emailOrUsername,
                email: response.data.email || emailOrUsername
            };

            Cookies.set('user', JSON.stringify(userInfo), {
                expires: 1,
                secure: false,
                sameSite: 'Lax',
                path: '/'
            });

            navigate('/plantinfo');

        } catch (error) {
            const errorInfo=getErrorMessage(error)
            setError(errorInfo.message)
        } finally {
            setIsLoading(false);
        }
    }

    const handleLogout = () => {
        Cookies.remove('token', { path: '/' });
        Cookies.remove('user', { path: '/' });
        setUserData(null);
        clearFields();
    }

    return (
        <div className={styles["login-container"]} >
            <canvas
                ref={canvasRef} className={styles["login-canvas"]}
                />
            <div className={styles["login-content"]}>
            <img className={styles.logo} src={logo} alt="Logo"></img>
            <div className={styles["form-container"]}>
                {!userData && (
                <>

                    <input
                        className={styles.button}
                        type="text"
                        placeholder="Email or Username"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value) }
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                    />

                    <div className={styles["password-wrapper"]}>
                        <input
                            className={styles.button}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                        />
                        <button
                            type="button"
                            className={styles["password-toggle"]}
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? "Hide Password" : "Show Password"}
                        </button>
                    </div>
                    {error && (
                        <div className={styles["error-text"]}>
                            {error}
                        </div>
                    )}
                    <Link className={styles.link} to="/Register">Forgot password?</Link>
                    <button className={styles.button2} type="submit" onClick={() => {handleLogin();}} disabled={isLoading}> {isLoading ? "Connecting in..." : "Connect" }
                        </button>
                    <p className={styles.color}>Don't have an account yet? <Link className={styles.link} to="/Register">Sign up</Link></p>
                    <p><Link className={styles.link} to="/PlantInfo">Back up for now</Link></p>
                </>
                    )}

                {userData && (
                    <div className={styles["user-info-panel"]}>
                        <h3>Welcome, {userData.username}!</h3>
                        <p><strong>Username:</strong> {userData.username}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <button className={styles.button2} onClick={handleLogout}>Logout</button>
                        <p><Link className={styles.link} to="/PlantInfo">Back up for now</Link></p>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}



export default Login;