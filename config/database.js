const mysql = require('mysql2/promise');
const {logger} = require('./winston');
require("dotenv").config();

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME
});

module.exports = {
    pool: pool
};