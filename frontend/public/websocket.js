function initSocket() {
    let socket = io({
        withCredentials: true
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

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
        window.location.href = "/";
    });

    socket.on("ready", ({ userID }) => {
        console.log("Ready update:", userID);
    });

    // --------------------
    // GAME EVENTS
    // --------------------
    socket.on("game_started", ({ isCreatorFirst }) => {
        console.log("Game started:", isCreatorFirst);
    });

    socket.on("state_changed", ({ newState }) => {
        // We get the state enum
        // const States = {
        //     P1_DRAW: "P1_DRAW",
        //     P1_PLACE: "P1_PLACE",
        //     P1_BATTLE: "P1_BATTLE",

        //     P2_DRAW: "P2_DRAW",
        //     P2_PLACE: "P2_PLACE",
        //     P2_BATTLE: "P2_BATTLE"
        // };
        console.log("State changed:", newState);
    });

    socket.on("card_taken", ({ userID, hand }) => {
        console.log("Card taken:", userID, hand); //hand is an array of ints which are card ids from the catalog
    });

    socket.on("card_placed", ({ board, hand, energy, userID }) => {
        console.log("Card placed:", userID, board, hand, energy);
    });

    socket.on("card_sacrificed", ({ board, energy, userID }) => {
        console.log("Card sacrificed:", board, energy, userID);
    });

    socket.on("battle_completed", ({ battleLog }) => {
        console.log("Battle:", battleLog);
    });
}