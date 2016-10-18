var pool = require('../config/mysql');

var weiboMd = function () {};

//添加动态
weiboMd.addWeibo = function (values, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into weibo set ?', values, function (err, result) {
            conn.release();
            if(err) throw err;
            cb(err, result);
        });
    })
};


//获取好友动态列表
weiboMd.getFriendsWeibolist = function (userid, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        //获取好友userid
        conn.query('select friendid from friendship_view where userid = ? ',userid, function (err,results) {
            if(err) throw err;

            //获取所有好友userid组装成字符串
            var friendids = userid+",";
            results.forEach(function (friend) {
                 friendids += friend.friendid+",";
            });
            friendids = friendids.substring(0,friendids.length-1);

            sql = "select * from weibo_view where userid in ( "+friendids+" ) order by time desc";
            //根据userid获取动态
            conn.query(sql, function (err,result) {
                conn.release();
                if(err) console.log(err);
                cb(err,result);
            });
        });

    });
};

module.exports = weiboMd;