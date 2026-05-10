const User = require("../database/models/user.js");
const { checkPassword } = require("../security/password.js");

class AuthController {
    static async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(422).json({
                    success: false,
                    message: "Missing login or password"
                });
            }

            const user = await User.findByLogin(login);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            const passwordCorrect = await checkPassword(
                password,
                user.password_hash
            );

            if (!passwordCorrect) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            req.session.user = {
                id: user.id,
                login: user.login
            };

            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: req.session.user
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }

    static me(req, res) {
        if (!req.session.user) {
            return res.status(401).json({
                loggedIn: false
            });
        }

        return res.status(200).json({
            loggedIn: true,
            user: req.session.user
        });
    }

    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to logout"
                });
            }

            return res.json({ message: "Session cleared" });
        });
    }
}

module.exports = AuthController;