const { Server } = require("socket.io");

let io;

function initIO(server, sessionMiddleware) {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    return io;
}

function getIO() {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}

module.exports = { initIO, getIO };