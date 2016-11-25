var pool = require("../config/mysql");

var mediaMd = function () { };

//判断公众号是否存在
mediaMd.isExist = function (media_id, cb) {
    console.log(media_id);
    pool.getConnection(function (err, conn) {
        conn.query("select * from media where media_id = ? ", media_id, function (err, results) {
            if(err) console.log(err);
            conn.release();
            console.log(results);
            cb(err, results);
        });
    });
}

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

//获取公众号下所有活动
mediaMd.getMediaAllActivitys = function (media_id,cb) {
    pool.getConnection(function (err, conn) {
        conn.query("select * from activity where media_id = ? ", media_id, function (err, results) {
            if(err) console.log(err);
            conn.release();
            cb(err, results)
        });
    });
};

//获取公众号下所有动态
mediaMd.getMediaAllWeibos = function (media_id,cb) {
    pool.getConnection(function (err, conn) {
        conn.query("select * from weibo_view where media_id = ? ", media_id, function (err, results) {
            if(err) console.log(err);
            conn.release();
            cb(err, results)
        });
    });
};

module.exports = mediaMd;