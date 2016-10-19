var pool = require('../config/mysql');

var friendMd = function () {};

//获取好友列表
friendMd.getGoodFriends = function (userid, cb) {
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
friendMd.getHomeFriends = function (schoolid, provinceid, cb) {
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


//查看好友主页信息
friendMd.getGoodFriendinfo = function (openid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from user_view where openid = ?", openid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//查看乡友主页信息
friendMd.getHomeFriendinfo = function (openid, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from user_view where openid = ?", openid, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//添加关注好友
friendMd.addFriend = function (userid, friendid, cb)  {
    pool.getConnection(function (err,conn) {
        if (err) throw err;
        conn.query("select * from friendship_view where userid = '"+userid+"' and friendid = '"+friendid+"'", function (err, result) {
            if (err) console.log(err);

            if(result == "" || result == null){
                conn.query("insert into friendship set ?", {userid:userid, friendid:friendid}, function (err, result) {
                    conn.release();
                    if (err) console.log(err);
                    cb(err, 1);
                });
            }else{
                conn.release();
                cb(err,0);
            }
        });
    });
};

//取消关注好友
friendMd.delFriend = function (userid, friendid, cb)  {
    pool.getConnection(function (err,conn) {
        if (err) throw err;
        conn.query("select * from friendship_view where userid = '"+userid+"' and friendid = '"+friendid+"'", function (err, result) {
            if (err) console.log(err);

            if(result == "" || result == null){
                conn.release();
                cb(err,0);
            }else{
                conn.query("delete from friendship where userid = '"+userid+"' and friendid = '"+friendid+"'", function (err, delresult) {
                    conn.release();
                    if (err) console.log(err);
                    console.log(delresult);
                    if(delresult)
                        cb(err, 1);
                    else
                        cb(err, 0);
                });
            }
        });
    });
};

//判断是否是好友关系
friendMd.isGoodFriend = function (userid, openid, cb) {
    pool.getConnection(function (err,conn) {
        if (err) throw err;
        conn.query("select * from friendship_view where userid = '"+userid+"' and openid = '"+openid+"'", function (err, result) {
            if (err) console.log(err);
            if(result == "" || result == null){
                cb(err,0);
            }else{
                cb(err,1);
            }
        });
    });
};

module.exports = friendMd;