import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Make it configurable for production
    },
});

// Used to store online users
const userSocketMap = {}; // { userId: socketId }

// Function to get receiver's socket ID
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];  // ✅ Now `userSocketMap` is properly defined before usage
}

// Handle new socket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        socket.userId = userId; // ✅ Store userId inside the socket instance
    }

    // Emit updated online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        
        if (socket.userId) {
            delete userSocketMap[socket.userId]; // ✅ More reliable way to handle disconnection
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };
