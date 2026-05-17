document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
            
    const showLoginBtn = document.getElementById("showLoginBtn");
    const showRegisterBtn = document.getElementById("showRegisterBtn");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    showLoginBtn.addEventListener("click", () => {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
        registerMessage.textContent = "";
    });

    showRegisterBtn.addEventListener("click", () => {
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
        loginMessage.textContent = "";
    });

    async function checkAuth() {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.loggedIn) {
            window.location.href = "/";
            return;
        }
    }
    checkAuth();

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(loginForm));
        
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            
            if (res.ok) {
                loginMessage.textContent = "Success! Entering tavern...";
                loginMessage.style.color = "green";
                loginForm.reset();

                window.location.href = "/";
            } else {
                loginMessage.textContent = result.message || "Invalid login or password";
                loginMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Login error:", error);
            loginMessage.textContent = "Server error. Try again later.";
            loginMessage.style.color = "red";
        }
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(registerForm));
        
        if (data.password !== data.confirmPassword) {
            registerMessage.textContent = "Passwords do not match";
            registerMessage.style.color = "red";
            return;
        }

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        registerMessage.textContent = result.message;
        registerMessage.style.color = result.success ? "green" : "red";
        
        if (result.success) {
            registerForm.reset();
            setTimeout(() => {
                registerSection.classList.add("hidden");
                loginSection.classList.remove("hidden");
                loginMessage.textContent = "Account created! Please log in.";
                loginMessage.style.color = "green";
            }, 1500);
        }
    });
});