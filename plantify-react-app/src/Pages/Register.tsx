import {useState} from 'react';
import {Link} from "react-router-dom";
import logo from '../assets/plantifylogotransp.png'
import { register } from "../api/authApi";
import "./Stylesheets/Register.css";

export function Register()
{
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleRegister = async () => {

        await register({

            email,
            password,
            username,
            name

        });

        alert("registered");

    };

    return (
        <div>
            <img className="logo" src={logo} alt="Logo"></img>
            <div>
                <input className="button" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <br/>
                <br/>
                <input className="button" type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                <br/>
                <br/>
                <button className="button2" type="submit" onClick={handleRegister}>Create account</button>
                <br/>
                <br/>
                <p>Have an account already?? <Link className="link" to="/">Log in</Link></p>

            </div>
        </div>
    );
}


export default Register;