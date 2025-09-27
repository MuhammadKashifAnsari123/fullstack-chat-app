import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from './routes/message.route.js'
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// ✅ CORS middleware should come FIRST
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

// ✅ Then body parsers with larger limit
app.use(express.json({ limit: "50mb" })); // Increased limit
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Then cookie parser
app.use(cookieParser());

// ✅ Then your routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Production mode static files
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// ✅ Test endpoint
app.get("/", (req, res) => {
    res.send("Server is running on port " + PORT);
});

server.listen(PORT, () => {
    console.log("server is running on port " + PORT);
    connectDB();
});
