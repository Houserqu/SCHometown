var mysql = require('mysql');

var pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : '382027881',
    database : 'hometown',
    connectionLimit : 5
});

module.exports = pool;