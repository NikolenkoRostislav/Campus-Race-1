const User = require("../database/models/user.js");
const { hashPassword } = require("../security/password.js");

class RegisterController {
    static async register(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return res.status(422).json({ message: "All fields are required" });
            }

            const foundUser = await User.findByLogin(login);

            if (foundUser) {
                return res.status(409).json({ message: "This login is already taken" });
            }

            const passwordHash = await hashPassword(password);

            const user = new User({
                login,
                password_hash: passwordHash
            });

            await user.save();

            return res.status(201).json({ message: "User successfully created" });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = RegisterController;