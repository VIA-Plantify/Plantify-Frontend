import { Router } from "express";
import {

    loginHandler,
    registerHandler

} from "../services/authService";

const router = Router();

router.post(
    "/login",
    loginHandler
);

router.post(
    "/register",
    registerHandler
);

export default router;