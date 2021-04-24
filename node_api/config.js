const mysql2 = require("mysql2/promise");
var config = {
    database: 'test', 
    user: 'root', 
    password: 'cs1808',
    host: 'localhost',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = mysql2.createPool(config);
module.exports = pool;