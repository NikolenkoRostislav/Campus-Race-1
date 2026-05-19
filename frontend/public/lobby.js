document.addEventListener("DOMContentLoaded", async () => {
    initSocket();

    const params = new URLSearchParams(window.location.search);
    const roomID = params.get("roomID");

    if (!roomID) {
        window.location.href = "/";
        return;
    }

    // Якщо тобі потрібно буде десь виводити roomID, додай елемент у HTML
    document.getElementById("roomId").textContent = roomID;

    const username1 = document.getElementById("username1");
    const username2 = document.getElementById("username2");

    // --------------------
    // LOAD INITIAL STATE
    // --------------------

    let contextCreatorID = null;
    let contextOpponentID = null;
    

    async function refreshLobby() {
        try {
            const { creatorID, opponentID } = await getLobbyMembers(roomID);
            contextCreatorID = creatorID;
            contextOpponentID = opponentID;

            const creator = await getUserByID(creatorID);
            username1.textContent = creator.login;

            if (opponentID) {
                const opponent = await getUserByID(opponentID);
                username2.textContent = opponent.login;
            } else {
                username2.textContent = "Waiting for player...";
            }

        } catch (e) {
            console.error("Failed to load lobby members:", e);
        }
    }

    await refreshLobby();

    // --------------------
    // BUTTONS
    // --------------------

    document.getElementById("leaveBtn").onclick = async () => {
        try {
            window.location.href = "/";
            await leaveLobby(roomID);
        } catch (e) {
            console.error("Leave lobby failed:", e);
        }
    };

    document.getElementById("startGameBtn").onclick = async () => {
        try {
            await startGame(roomID);
        } catch (e) {
            console.error("Start game failed:", e);
        }
    };

    // --------------------
    // SOCKET EVENTS
    // --------------------
    window.socket.on("opponent_joined", refreshLobby);
    window.socket.on("opponent_left", refreshLobby);

    window.socket.on("lobby_deleted", () => {
        window.location.href = "/";
    });

    window.socket.on("game_started", async ({ isCreatorFirst }) => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            const myID = data.user.id;

            const mySide = (myID === contextCreatorID) ? (isCreatorFirst ? 1 : -1) : (isCreatorFirst ? -1 : 1);

            const enemyID = (myID === contextCreatorID) ? contextOpponentID : contextCreatorID;

            window.location.href = `/game?roomID=${roomID}&side=${mySide}&enemyID=${enemyID}`;
        } catch (err) {
            console.error("Redirection parsing error:", err);
            window.location.href = `/game?roomID=${roomID}`;
        }
    });

    // --------------------
    // COPY ROOM ID
    // --------------------

    const roomIdContainer = document.getElementById("roomIdContainer");
    const copyTooltip = document.getElementById("copyTooltip");

    roomIdContainer.onclick = async() => {
        const idText = document.getElementById("roomId").textContent;

        if (idText == "Loading...") return;

        try {
            await navigator.clipboard.writeText(idText);

            copyTooltip.classList.add("show");

            setTimeout(() => {
                copyTooltip.classList.remove("show");
            }, 2000);
        } catch (e) {
            console.error("Failed to copy room ID:", e);
        }
    };
});