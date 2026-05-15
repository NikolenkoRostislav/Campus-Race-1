const pool = require("../db.js");

class User {
    constructor({ id = null, login, password_hash } = {}) {
        this.id = id;
        this.login = login;
        this.password_hash = password_hash;
    }

    static _fromRows(rows) {
        if (!rows || rows.length === 0) return null;

        return new User({
            id: rows[0].id,
            login: rows[0].login,
            password_hash: rows[0].password_hash
        });
    }

    static async findById(id) {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        return User._fromRows(rows);
    }

    static async findByLogin(login) {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE login = ?",
            [login]
        );

        return User._fromRows(rows);
    }

    async save() {
        if (this.id) {
            await pool.query(
                `UPDATE users
                SET login = ?, password_hash = ?
                WHERE id = ?`,
                [this.login, this.password_hash, this.id]
            );

            return this;
        }

        const [result] = await pool.query(
            `INSERT INTO users (login, password_hash)
            VALUES (?, ?)`,
            [this.login, this.password_hash]
        );

        this.id = result.insertId;
        return this;
    }

    async delete() {
        if (!this.id) {
            throw new Error("Cannot delete user without id");
        }

        await pool.query(
            "DELETE FROM users WHERE id = ?",
            [this.id]
        );

        return true;
    }
}

module.exports = User;