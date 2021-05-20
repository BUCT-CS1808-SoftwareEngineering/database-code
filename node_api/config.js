const mysql2 = require("mysql2/promise");
var config = {
    database: 'cs1808test',
    user: 'root',
    password: 'A4W^:s3aW33p',
    host: '149.129.54.32',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = mysql2.createPool(config);
module.exports = pool;
