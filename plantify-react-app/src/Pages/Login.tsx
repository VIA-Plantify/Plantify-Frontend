import {useEffect, useRef, useState} from 'react';
import { Link } from "react-router-dom"
import logo from '../assets/plantifylogotransp.png'
import "./Stylesheets/Login.css";
import Cookies from 'js-cookie';
import {getErrorMessage, login} from "../api/authApi";

export function Login() {
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

            setUserData(userInfo);
            clearFields();

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
        <div className="login-container" >
            <canvas
                ref={canvasRef}
                />
            <img className="logo" src={logo} alt="Logo"></img>

            <div>
                {!userData && (
                <>

                    <input className="button" type="text" placeholder="Email or Username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value) } />
                    <br/>
                    <br/>
                    <input className="button" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <br/>
                    {error && (
                        <div className="error-text">
                            {error}
                        </div>
                    )}
                    <br/>
                    <Link className="link" to="/Register">Forgot password?</Link>
                    <br/>
                    <button className="button2" type="submit" onClick={() => {handleLogin();}} disabled={isLoading}> {isLoading ? "Logging in..." : "Login" }
                        </button>
                    <br/>
                    <p>Don't have an account yet? <Link className="link" to="/Register">Sign up</Link></p>
                </>
                    )};

                {userData && (
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '100px' }}>
                        <h3>Welcome, {userData.username}!</h3>
                        <p><strong>Username:</strong> {userData.username}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <button className="button2" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
}



export default Login;