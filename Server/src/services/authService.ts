import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const API_URL = process.env.API_URL;
export const registerHandler =
    async (req: Request, res: Response) => {

        try {

            const response = await fetch(

                `${API_URL}/User`,

                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: req.body.email,
                        password: req.body.password,
                        username: req.body.username ?? req.body.email,
                        name: req.body.name ?? req.body.email
                    })
                }

            );

            if (!response.ok) {
                const text = await response.text();
                return res.status(response.status).send(text);
            }

            const data = await response.json();
            res.json({ success: true, user: data });

        }
        catch (error) {
            res.status(500).send("register error");
        }

    };


export const loginHandler =
    async (req: Request, res: Response) => {

        try {

            const response = await fetch(

                `${API_URL}/Auth/login`,

                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: req.body.email,
                        username: req.body.username,
                        password: req.body.password
                    })
                }

            );

            if (!response.ok) {
                const text = await response.text();
                return res.status(401).send(text);
            }

            const token = await response.text();

            const payload = JSON.parse(
                Buffer.from(token.split(".")[1]!, "base64").toString()
            );
            console.log("JWT payload:", payload);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax"
            });

            res.json({
                success: true,
                username: payload.Username,
                email: payload.Email
            });

        }
        catch (error) {
            res.status(500).send("login error");
        }

    };