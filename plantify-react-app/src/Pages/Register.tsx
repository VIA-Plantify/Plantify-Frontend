import React from 'react';
import {Link} from "react-router-dom";
import logo from '../assets/plantifylogotransp.png'
import "./Stylesheets/Register.css";

export function Register() {
    return (
        <div>
            <img className="logo" src={logo} alt="Logo"></img>
            <div>
                <input className="button" type="email" placeholder="Email" />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Username" />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Name" />
                <br/>
                <br/>
                <input className="button" type="password" placeholder="Password" />
                <br/>
                <br/>
                <input className="button" type="password" placeholder="Confirm Password"/>
                <br/>
                <br/>
                <button className="button2" type="submit">Create account</button>
                <br/>
                <br/>
                <p>Have an account already? <Link className="link" to="/">Log in</Link></p>
            </div>
        </div>
    );
}


export default Register;