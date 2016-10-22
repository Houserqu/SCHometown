/**
 * Created by Houser on 16/8/30.
 */
var pool = require('../config/mysql');

var userMd = function () {};


//获取用户信息
userMd.getUserinfo = function (userid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from user_view where iduser = ?", userid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};


//修改User信息
userMd.updateUser = function (userid, column, value, cb) {

    pool.getConnection(function (err,conn) {
        if(err) throw err;
        var sql = "update user set "+column+" = '"+value+"' where iduser = "+userid;
        conn.query(sql, function (err,result) {
            conn.release();
            if(err) console.log(sql);
            cb(err,result);
        });
    });
};

//修改userinfo信息
userMd.updateUserinfo = function (userid, column, value, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("update userinfo set "+column+" = '"+value+"' where userid = "+userid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//修改家乡身份城市信息
userMd.updateUserHometown = function (userid, pid, city, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("update userinfo set homeprovinceid = ? ,homecityid = ?  where userid = ? " , [pid, city, userid], function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//修改学校信息
userMd.updateUserSchool = function (userid, pid, sid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("update userinfo set schoolprovinceid = ? ,schoolid = ?  where userid = ? " , [pid, sid, userid], function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
}

//获取自己发起的活动
userMd.getMyActivitys = function (userid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from activity_view where userid = ?", userid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//获取自己参与的活动
userMd.getMyJoinActivitys = function (userid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from activity_join_view where userid = ?", userid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};


//获取用户动态列表
userMd.getUserWeibos = function (openid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from weibo_view where openid = ?", openid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};


module.exports = userMd;