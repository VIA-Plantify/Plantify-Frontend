import { Request, Response } from "express";

const API_URL =
    "https://localhost:5001/api/auth";

export const registerHandler =
    async (
        req: Request,
        res: Response
    ) => {

        const response =
            await fetch(

                `${API_URL}/register`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(req.body)

                }

            );

        if (!response.ok) {

            return res
                .status(400)
                .send("register error");

        }

        const data =
            await response.json();

        res.cookie(

            "token",

            data.token,

            {

                httpOnly: true,
                secure: false

            }

        );

        res.json({

            success: true

        });

    };

export const loginHandler =
    async (
        req: Request,
        res: Response
    ) => {

        const response =
            await fetch(

                `${API_URL}/login`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(req.body)

                }

            );

        if (!response.ok) {

            return res
                .status(401)
                .send("invalid login");

        }

        const data =
            await response.json();

        res.cookie(

            "token",

            data.token,

            {

                httpOnly: true,
                secure: false

            }

        );

        res.json({

            success: true

        });

    };