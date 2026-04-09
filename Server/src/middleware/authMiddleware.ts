import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as process from "node:process";

export const authMiddleware = (

    req: Request,
    res: Response,
    next: NextFunction

) => {

    const token = req.cookies?.token;

    if (!token) {

        return res
            .status(401)
            .send("Unauthorized");

    }

    try {

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET!

        );

        req.user = decoded;

        next();

    }
    catch (error) {

        return res
            .status(401)
            .send("Invalid token");

    }

};