const { getIO } = require("./socketManager.js");
const game = require("../controllers/gameController.js");

const disconnectTimers = new Map();

function initWebSocketHandlers() {
    const io = getIO();

    io.on("connection", (socket) => {
        const user = socket.request.session?.user;
        if (!user) return socket.disconnect();

        socket.userId = user.id;
        socket.join(user.id);

        if (disconnectTimers.has(socket.userId)) {
            clearTimeout(disconnectTimers.get(socket.userId));
            disconnectTimers.delete(socket.userId);
            console.log(`Reconnect detected: ${socket.userId}`);
        }

        socket.on("disconnect", () => {
            const userId = socket.userId;

            if (!userId) return;

            console.log(`Disconnect detected: ${userId} (grace period started)`);

            const timer = setTimeout(() => {
                console.log(`Finalizing disconnect: ${userId}`);
                game.deleteGameByUserID(userId);
                disconnectTimers.delete(userId);
            }, 10000);

            disconnectTimers.set(userId, timer);
        });
    });
}

module.exports = { initWebSocketHandlers };