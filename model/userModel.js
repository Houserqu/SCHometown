/**
 * Created by Houser on 16/8/30.
 */
var pool = require('../config/mysql');

var userMd = function () {};

//获取好友列表
userMd.getGoodFriends = function (userid, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from friendship_view where userid = ? ',userid, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};

//获取乡友列表
userMd.getHomeFriends = function (schoolid, provinceid, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query("select * from user_view where schoolid = "+schoolid+" AND provinceid = "+ provinceid, function (err,results) {
            conn.release();
            console.log(results);
            if(err) throw err;
            cb(err, results);
        });
    });
};

userMd.getFriendinfo = function (openid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from user_view where openid = ?", openid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//获取用户信息
userMd.getUserinfo = function (userid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from user_view where userid = ?", userid, function (err,result) {
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

module.exports = userMd;