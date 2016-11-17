var pool = require("../config/mysql");

var mediaMd = function () { };

//获取公众号下所有用户
mediaMd.getAllUsers = function (media_id,cb) {
    pool.getConnection(function (err, conn) {
        conn.query("select * from user_view where media_id = ? ", media_id, function (err, results) {
            if(err) console.log(err);
            conn.release();
            cb(err, results)
        });
    });
};

//获取公众号下所有老乡会
mediaMd.getMediaHometown = function (media_id,cb) {
    pool.getConnection(function (err, conn) {
        conn.query("select * from media_hometown where media_id = ? ", media_id, function (err, results) {
            if(err) console.log(err);
            conn.release();
            cb(err, results)
        });
    });
};

module.exports = mediaMd;