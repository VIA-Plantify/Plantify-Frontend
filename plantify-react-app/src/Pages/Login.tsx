import React from 'react';
import { Link } from "react-router-dom"
import logo from '../assets/plantifylogotransp.png'
import "./Stylesheets/Login.css";

export function Login() {
    return (
        <div>
            <img className="logo" src={logo} alt="Logo"></img>

            <div>
                <input className="button" type="text" placeholder="Email or username" />
                <br/>
                <br/>
                <input className="button" type="password" placeholder="Password" />
                <br/>
                <Link className="link" to="/Register">Forgot password?</Link>
                <br/>
                <button className="button2" type="submit">Login</button>
                <br/>
                <p>Don't have an account yet? <Link className="link" to="/Register">Sign up</Link></p>
            </div>
        </div>
    );
}


export default Login;