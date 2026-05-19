let socket;

function initSocket() {
    socket = io({
        withCredentials: true
    });
    window.socket = socket;

    // --------------------
    // LOBBY EVENTS
    // --------------------
    socket.on("opponent_joined", ({ userID }) => {
        console.log("Opponent joined:", userID);
    });

    socket.on("opponent_left", () => {
        console.log("Opponent left");
    });

    socket.on("lobby_deleted", () => {
        console.log("Lobby deleted");
    });

    // --------------------
    // GAME EVENTS
    // --------------------
    socket.on("game_started", ({ isCreatorFirst }) => {
        console.log("Game started:", isCreatorFirst);
    });

    socket.on("state_changed", ({ newState, board, handP1, handP2, energyP1, energyP2 }) => {
        console.log("State changed:", newState);
        window.currentState = newState;

        if (board) {
            window.syncBoard(board);
        }

        if (window.mySide === 1) {
            if (handP1) window.updateHand(handP1);
            if (energyP1 !== undefined) window.updateEnergy(energyP1);
        } else if (window.mySide === -1) {
            if (handP2) window.updateHand(handP2);
            if (energyP2 !== undefined) window.updateEnergy(energyP2);
        }

        if (typeof window.highlightValidSlots === 'function') {
            window.highlightValidSlots();
        }

        const endTurnBtn = document.getElementById('end-turn-btn');
        if (endTurnBtn) {
            const isMyPlacePhase = (window.mySide === 1 && newState === "P1_PLACE") ||
                (window.mySide === -1 && newState === "P2_PLACE");

            endTurnBtn.style.display = isMyPlacePhase ? "block" : "none";
        }
    });

    socket.on("card_taken", ({ userID, hand }) => {
        console.log("Card taken:", userID, hand);

        if (userID === window.myUserID) {
            window.updateHand(hand);
        }
    });

    socket.on("card_placed", ({ board, hand, energy, userID }) => {
        console.log("Card placed:", userID, board, hand, energy);
        // Always update the board rendering for both players
        window.syncBoard(board);

        if (userID === window.myUserID) {
            window.updateHand(hand);
            window.updateEnergy(energy);
        }
    });

    socket.on("card_sacrificed", ({ board, energy, userID }) => {
        console.log("Card sacrificed:", board, energy, userID);
        window.syncBoard(board);
        if (userID === window.myUserID) {
            window.updateEnergy(energy);
        }
    });

    socket.on("battle_completed", ({ battleLog }) => {
        console.log("Battle loop complete:", battleLog);

        if (typeof window.processAttackQueue === "function") {
            window.processAttackQueue(battleLog);
        }
    });

    socket.on("game_ended", (data) => {
        console.log("Game ended:", data);
        if (!data?.winnerID) {
            window.location.href = '/';
        }
    });
}