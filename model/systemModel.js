var pool = require('../config/mysql');

var systemMd = function () {};

systemMd.submitfeedback = function (userid, content, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("insert into feedback set ? ",{userid: userid, content:content}, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

module.exports = systemMd;