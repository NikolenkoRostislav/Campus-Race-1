document.addEventListener("DOMContentLoaded", () => {
    const userIDText = document.getElementById("userID");
    const userAvatar = document.getElementById("userAvatar");

    const dashboardView = document.getElementById("dashboardView");
    const joinRoomView = document.getElementById("joinRoomView");
    const profileView = document.getElementById("profileView");

    const showJoinRoomBtn = document.getElementById("showJoinRoomBtn");
    const showProfileBtn = document.getElementById("showProfileBtn");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    function hideAllViews() {
        dashboardView.classList.add("hidden");
        joinRoomView.classList.add("hidden");
        profileView.classList.add("hidden");
    }

    createRoomBtn.addEventListener("click", () => {
        window.location.href = "/create-room";
    });

    showJoinRoomBtn.addEventListener("click", () => {
        hideAllViews();
        joinRoomView.classList.remove("hidden");
    });

    showProfileBtn.addEventListener("click", () => {
        hideAllViews();
        profileView.classList.remove("hidden");
    });

    async function checkAuth() {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!data.loggedIn) {
            window.location.href = "/login";
            return;
        }
        
        userIDText.textContent = `User ID: ${data.user.id}`;
        
        if (data.user.avatar_url) {
            userAvatar.src = data.user.avatar_url;
            userAvatar.style.display = "block";
        }
    }

    checkAuth();

    logoutBtn.addEventListener("click", async () => {
        await fetch("/api/logout", { method: "POST" });
        await checkAuth();
    });

    document.getElementById("joinRoomForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const roomId = e.target.roomId.value;
        const msg = document.getElementById("joinMessage");
        msg.textContent = `Connecting to room ${roomId}...`;
        msg.style.color = "#333";
    });

    document.getElementById("profileForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const msg = document.getElementById("profileMessage");
        msg.textContent = "Profile updating... (requires backend setup)";
        msg.style.color = "green";
    });
});