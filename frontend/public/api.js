// api/lobby.js

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
// LOBBY API
// --------------------

export async function createLobby() {
    return request("/api/lobby/new", {
        method: "POST",
    });
}

export async function joinLobby(roomID) {
    return request("/api/lobby/join", {
        method: "POST",
        body: JSON.stringify({ roomID }),
    });
}

export async function leaveLobby(roomID) {
    return request(`/api/lobby/leave?roomID=${encodeURIComponent(roomID)}`, {
        method: "DELETE",
    });
}

export async function setReady(roomID) {
    return request("/api/lobby/ready", {
        method: "POST",
        body: JSON.stringify({ roomID }),
    });
}

// --------------------
// GAME API
// --------------------

export async function drawCard(roomID, random = false) {
    return request("/api/game/draw", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            random
        }),
    });
}

export async function placeCard(roomID, x, cardID) {
    return request("/api/game/place", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            x,
            cardID
        }),
    });
}

export async function sacrificeCard(roomID, x) {
    return request("/api/game/sacrifice", {
        method: "POST",
        body: JSON.stringify({
            roomID,
            x
        }),
    });
}

export async function endPlacePhase(roomID) {
    return request("/api/game/end-place", {
        method: "POST",
        body: JSON.stringify({
            roomID
        }),
    });
}

export async function endGame(roomID) {
    return request(`/api/game/end?roomID=${encodeURIComponent(roomID)}`, {
        method: "DELETE",
    });
}

export async function getGameboard(roomID) {
    return request(`/api/game/board?roomID=${encodeURIComponent(roomID)}`);
}

export async function getHand(roomID) {
    return request(`/api/game/hand?roomID=${encodeURIComponent(roomID)}`);
}