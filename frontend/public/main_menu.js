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

    const joinForm = document.getElementById("joinRoomForm");
    const profileForm = document.getElementById("profileForm");

    function hideAllViews() {
        dashboardView.classList.add("hidden");
        joinRoomView.classList.add("hidden");
        profileView.classList.add("hidden");
    }

    showJoinRoomBtn.addEventListener("click", () => {
        hideAllViews();
        joinRoomView.classList.remove("hidden");
    });

    showProfileBtn.addEventListener("click", () => {
        hideAllViews();
        profileView.classList.remove("hidden");
    });

    createRoomBtn.addEventListener("click", async () => {
        try {
            const res = await createLobby();

            const roomID = res.roomID || res;

            window.location.href = `/lobby?roomID=${roomID}`;
        } catch (e) {
            console.error("Create lobby failed:", e);
        }
    });

    joinForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const roomID = new FormData(joinForm).get("roomId");
        const msg = document.getElementById("joinMessage");

        try {
            msg.textContent = "Connecting...";
            msg.style.color = "#333";

            await joinLobby(roomID);

            window.location.href = `/lobby?roomID=${roomID}`;
        } catch (e) {
            console.error("Join lobby failed:", e);

            msg.textContent = "Failed to join room";
            msg.style.color = "red";
        }
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const msg = document.getElementById("profileMessage");
        const form = new FormData(profileForm);
        const url = form.get("avatarUrl")?.trim();

        if (!url) {
            msg.textContent = "Please enter a URL";
            msg.style.color = "red";
            return;
        }

        try {
            msg.textContent = "Saving...";
            msg.style.color = "#333";

            await updatePfpUrl(url);

            userAvatar.src = url;
            userAvatar.style.display = "block";

            msg.textContent = "Profile updated!";
            msg.style.color = "green";
        } catch (e) {
            console.error(e);

            msg.textContent = "Failed to update profile";
            msg.style.color = "red";
        }
    });

    async function checkAuth() {
        try {
            const res = await fetch("/api/me", {
                credentials: "include"
            });

            const data = await res.json();

            if (!data.loggedIn) {
                window.location.href = "/login";
                return;
            }
            
            const userInfo = await getUserByID(data.user.id);
            userIDText.textContent = userInfo.login;

            const defaultAvatarUrl = "https://i.pinimg.com/736x/16/2a/9c/162a9c07ec2e669d6de08a37a40bc282.jpg";

            if (userInfo && userInfo.pfp_url) {
                userAvatar.src = userInfo.pfp_url;
            } else {
                userAvatar.src = defaultAvatarUrl;
            }
            
            userAvatar.style.display = "block";

        } catch (e) {
            console.error("Auth check failed:", e);
        }
    }

    checkAuth();

    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include"
            });

            window.location.href = "/login";
        } catch (e) {
            console.error("Logout failed:", e);
        }
    });
});