import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import logo from '../assets/plantifylogotransp.png'

import styles from "./Stylesheets/Register.module.css";
import { getErrorMessage, register, login } from "../api/authApi";
import Cookies from 'js-cookie';
import emailIcon from '../assets/icons/email.png';
import nameIcon from '../assets/icons/name.png';
import passwordIcon from '../assets/icons/password.png';
import userIcon from '../assets/icons/user.png';

export function Register()
{
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showPassword, setShowPassword] = useState(false);
const  validatePassword=(pwd: string) => {
        return{
            length: pwd.length >= 8 && pwd.length <= 64,
            numberSpecial: /[0-9]/.test(pwd) && /[!@#$%^&*()*+.\-]/.test(pwd),
            upperLower:/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)
        };
};

    const passwordValidation = validatePassword(password);

    useEffect(() => {
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

    const handleRegister = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await register({ email, password, username, name });

            const response = await login({
                email: email,
                username: "",
                password: password
            });

            const userInfo = {
                username: response.data.username || username,
                email: response.data.email || email
            };

            Cookies.set('user', JSON.stringify(userInfo), {
                expires: 1,
                secure: false,
                sameSite: 'Lax',
                path: '/'
            });

            navigate('/plantinfo');

        } catch (error) {
            const errorInfo = getErrorMessage(error);
            setError(errorInfo.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles["register-container"]}>
            <canvas
                ref={canvasRef} className={styles["register-canvas"]}
            />
            <div className={styles["register-content"]}>
            <img className={styles.logo} src={logo} alt="Logo"></img>
            <div className={styles["form-container"]}>
                <div className={styles["wrapper"]}>
                    <img
                        src={emailIcon}
                        alt="email icon"
                        className={styles["icon"]}
                    />
                    <input
                        className={styles.button}
                        type="email" placeholder="Email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
                    />
                </div>
                <div className={styles["wrapper"]}>
                    <img
                        src={userIcon}
                        alt="user icon"
                        className={styles["icon"]}
                    />
                    <input
                        className={styles.button}
                        type="text" placeholder="Username"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
                    />
                </div>
                <div className={styles["wrapper"]}>
                    <img
                        src={passwordIcon}
                        alt="password icon"
                        className={styles["icon"]}
                    />
                    <input
                        className={styles.button}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                    />
                    <button
                        type="button"
                        className={styles["password-toggle"]}
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        {showPassword ? "Hide Password" : "Show Password"}
                    </button>
                </div>
                {isPasswordFocused && (
                    <div className={styles["password-validation"]}>
                        <p className={passwordValidation.length ? styles.valid : styles.invalid}>
                            {passwordValidation.length ? "✓" : "✗"} Password must be between 8 and 64 characters
                        </p>
                        <p className={passwordValidation.numberSpecial ? styles.valid : styles.invalid}>
                            {passwordValidation.numberSpecial ? "✓" : "✗"} Password must contain at least one number and one special character
                        </p>
                        <p className={passwordValidation.upperLower ? styles.valid : styles.invalid}>
                            {passwordValidation.upperLower ? "✓" : "✗"} Password must contain at least one uppercase and one lowercase letter
                        </p>
                    </div>
                )}

                <div className={styles["wrapper"]}>
                    <img
                        src={nameIcon}
                        alt="name icon"
                        className={styles["icon"]}
                    />
                    <input
                    className={styles.button}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
                    />
                </div>

                {
                    error && (
                        <div className={styles["error-text"]}>
                            {error}
                        </div>
                    )}
                <button className={styles.button2} type="submit" onClick={() => {handleRegister();}}
                        disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</button>
                <p className={styles.color}>Have an account already? <Link className="link" to="/">Log in</Link></p>

            </div>
        </div>
        </div>
    );
}


export default Register;