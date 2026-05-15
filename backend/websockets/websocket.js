const { Server } = require("socket.io");

let io;

function initWebSocket(server, sessionMiddleware) {
    io = new Server(server, {
        cors: { origin: "*" }, //I'll change this later
    });

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    io.on("connection", (socket) => {
        if (!socket.request.session?.user) return socket.disconnect();
        const userId = socket.request.session.user.id;
        if (!userId) return socket.disconnect();
        socket.join(userId);
    });
}

function getIO() {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}

module.exports = { initWebSocket, getIO };