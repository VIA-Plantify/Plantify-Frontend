import {useEffect, useRef, useState} from 'react';
import {Link} from "react-router-dom";
import logo from '../assets/plantifylogotransp.png'

import {getErrorMessage, register} from "../api/authApi";
import "./Stylesheets/Register.css";

export function Register()
{
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const clearFields = () => {
        setEmail("");
        setUsername("");
        setPassword("");
        setName("");
        setError(null);
    }
const  validatePassword=(pwd: string) => {
        return{
            length: pwd.length >= 8 && pwd.length <= 64,
            numberSpecial: /[0-9]/.test(pwd) && /[!@#$%^&*()*+\-]/.test(pwd),
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
        }

        let waves: Wave[] = [];

        const getMaxRadius = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const cornerX = Math.max(centerX, canvas.width - centerX);
            const cornerY = Math.max(centerY, canvas.height - centerY);
            return Math.sqrt(cornerX * cornerX + cornerY * cornerY);
        };

        const addWave = () => {
            waves.push({
                radius: 8,
                opacity: 0.55,
                maxRadius: getMaxRadius() + 60
            });
        };

        addWave();

        let frameCounter = 0;
        const framesBetweenWaves = 140;

        let animationId: number;

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            for (let i = 0; i < waves.length; i++) {
                const wave = waves[i];

                wave.radius += 0.5;

                wave.opacity = 0.5 * (1 - wave.radius / wave.maxRadius);

                ctx.beginPath();
                ctx.arc(centerX, centerY, wave.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(70, 210, 65, ${Math.max(0, wave.opacity)})`;
                ctx.lineWidth = 6;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(centerX, centerY, wave.radius - 4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(90, 230, 85, ${Math.max(0, wave.opacity - 0.08)})`;
                ctx.lineWidth = 4;
                ctx.stroke();

                if (wave.radius > 25) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, wave.radius - 8, 0, Math.PI * 2);
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
                if (waves.length < 4) {
                    addWave();
                } else if (Math.random() < 0.15) {
                    addWave();
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResizeAndReset = () => {
            resize();
            waves = [];
            addWave();
            frameCounter = 30;
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
            await register({

                email,
                password,
                username,
                name

            });

            alert("Registered successfully!");
            clearFields();
        }catch(error) {
            const errorInfo=getErrorMessage(error);
            setError(errorInfo.message);
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <canvas
                ref={canvasRef}
            />
            <img className="logo" src={logo} alt="Logo"></img>
            <div>
                <input className="button" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <br/>
                <br/>
                <input
                    className="button"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                />
                {isPasswordFocused && (
                    <div className="password-validation">
                        <p className={passwordValidation.length ? "valid" : "invalid"}>
                            {passwordValidation.length ? "✓" : "✗"} Password must be between 8 and 64 characters
                        </p>
                        <p className={passwordValidation.numberSpecial ? "valid" : "invalid"}>
                            {passwordValidation.numberSpecial ? "✓" : "✗"} Password must contain at least one number and one special character
                        </p>
                        <p className={passwordValidation.upperLower ? "valid" : "invalid"}>
                            {passwordValidation.upperLower ? "✓" : "✗"} Password must contain at least one uppercase and one lowercase letter
                        </p>
                    </div>
                )}
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <br/>
                <br/>
                {
                    error && (
                        <div className="error-text">
                            {error}
                        </div>
                    )}
                <br/>
                <button className="button2" type="submit" onClick={() => {handleRegister(); clearFields();}}
                        disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</button>
                <br/>
                <br/>
                <p>Have an account already?? <Link className="link" to="/">Log in</Link></p>

            </div>
        </div>
    );
}


export default Register;