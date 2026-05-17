async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        ...options,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.message || "Request failed");
    }

    return data;
}

// --------------------
// USER API
// --------------------

async function updatePfpUrl(pfp_url) {
    return request("/api/user/pfp_url", {
        method: "PATCH",
        body: JSON.stringify({ pfp_url }),
    });
}

async function getUserByID(id) {
    return request(`/api/user?id=${encodeURIComponent(id)}`, {
        method: "GET",
    });
}

// --------------------
// LOBBY API
// --------------------

async function getLobbyMembers(roomID) {
    return request(`/api/lobby/members?roomID=${encodeURIComponent(roomID)}`, {
        method: "GET",
    });

}
async function createLobby() {
    return request("/api/lobby/new", {
        method: "POST",
    }); // roomID
}

async function joinLobby(roomID) {
    return request("/api/lobby/join", {
        method: "POST",
        body: JSON.stringify({ roomID }),
    });
}

async function leaveLobby(roomID) {
    return request(`/api/lobby/leave?roomID=${encodeURIComponent(roomID)}`, {
        method: "DELETE",
    });
}

// --------------------
// GAME API
// --------------------

async function startGame(roomID) {
    return request("/api/game/start", {
        method: "POST",
        body: JSON.stringify({
            roomID
        }),
    });
}

async function drawCard(roomID, random = false) {
    return request("/api/game/draw", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            random
        }),
    });
}

async function placeCard(roomID, x, cardID) {
    return request("/api/game/place", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            x,
            cardID
        }),
    });
}

async function sacrificeCard(roomID, x) {
    return request("/api/game/sacrifice", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            x
        }),
    });
}

async function endPlacePhase(roomID) {
    return request("/api/game/end-place", {
        method: "POST",
        body: JSON.stringify({
            roomID
        }),
    });
}

async function endGame(roomID) {
    return request(`/api/game/end?roomID=${encodeURIComponent(roomID)}`, {
        method: "DELETE",
    });
}

async function getGameboard(roomID) {
    return request(`/api/game/board?roomID=${encodeURIComponent(roomID)}`);
}

async function getHand(roomID) {
    return request(`/api/game/hand?roomID=${encodeURIComponent(roomID)}`);
}