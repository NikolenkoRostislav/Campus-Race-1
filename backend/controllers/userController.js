const User = require("../database/models/user.js");

class UserController {
    static async updatePFP(req, res) {
        try {
            const { pfp_url } = req.body;

            const userID = req.session.user.id;
            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.pfp_url = pfp_url;
            await user.save();
            return res.status(200).json({ message: "PFP updated successfully" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }

    static async getUserByID(req, res) {
        try {
            const userID = req.query.id;
            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ login: user.login, pfp_url: user.pfp_url });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = UserController;