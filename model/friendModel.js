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

//添加好友
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

module.exports = friendMd;