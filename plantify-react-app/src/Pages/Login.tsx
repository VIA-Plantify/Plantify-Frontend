import {useState} from 'react';
import { Link } from "react-router-dom"
import logo from '../assets/plantifylogotransp.png'
import "./Stylesheets/Login.css";
import { login } from "../api/authApi";

export function Login() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");

    const handleLogin = async () => {

        const response = await login({
            email,
            username
        });

        console.log(response.data);
    }
    return (
        <div>
            <img className="logo" src={logo} alt="Logo"></img>

            <div>
                <input className="button" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <br/>
                <Link className="link" to="/Register">Forgot password?</Link>
                <br/>
                <button className="button2" type="submit" onClick={handleLogin}>Login</button>
                <br/>
                <p>Don't have an account yet? <Link className="link" to="/Register">Sign up</Link></p>
            </div>
        </div>
    );
}



export default Login;