var mysql = require('mysql');

var pool = mysql.createPool({
    host     : 'localhost',
    user     : '',
    password : '',
    database : '',
    connectionLimit : 5
});

module.exports = pool;