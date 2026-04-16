import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const ORIGIN  = process.env.ORIGIN;
app.use(cors({
    origin: ORIGIN,
    credentials: true
}));

const PORT  = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/test", (req , res) => {
    res.json({ message: "Server is working" });
});

app.listen(PORT, () => {
    console.log(`BFF running on port ${PORT}`);
});