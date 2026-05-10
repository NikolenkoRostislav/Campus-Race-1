const mysql = require("mysql2/promise");
require('dotenv').config();

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const name = process.env.DB_NAME;

const config = {
    host,
    user,
    password,
    database: name
};

const pool = mysql.createPool(config);

module.exports = pool;