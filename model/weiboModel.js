var pool = require('../config/mysql');

var weiboMd = function () {
};

//获取乡友动态
weiboMd.getHometownWeibolist = function ( schoolid, homeprovinceid, cb) {
    pool.getConnection(function (err, conn) {
        sql = "select * from weibo_view where homeprovinceid = ? and schoolid = ? order by origintime desc  limit 30 ";
        conn.query(sql, [homeprovinceid, schoolid], function (err, result) {
            conn.release();
            if (err) console.log(err);
            cb(err, result);
        });
    });
};
//添加动态
weiboMd.addWeibo = function (values, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('insert into weibo set ?', values, function (err, result) {
            conn.release();
            if (err) throw err;
            cb(err, result);
        });
    })
};

//获取动态详情
weiboMd.getOneWeibo = function (weiboid, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('select * from weibo_view where idweibo =  ?',weiboid , function (err, result) {
            conn.release();
            if (err) throw err;
            cb(err, result);
        });
    })
};

//获取动态评论
weiboMd.getWeiboComment = function (weiboid, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('select * from weibo_comment_view where weiboid = ?',weiboid , function (err, result) {
            conn.release();
            if (err) throw err;
            cb(err, result);
        });
    })
};
//获取好友动态列表
weiboMd.getFriendsWeibolist = function (userid, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        //获取好友userid
        conn.query('select friendid from friendship_view where userid = ? ', userid, function (err, results) {
            if (err) throw err;

            //获取所有好友userid组装成字符串
            var friendids = userid + ",";
            results.forEach(function (friend) {
                friendids += friend.friendid + ",";
            });
            friendids = friendids.substring(0, friendids.length - 1);

            sql = "select * from weibo_view where userid in ( " + friendids + " ) order by origintime desc";
            //根据userid获取动态
            conn.query(sql, function (err, result) {
                conn.release();
                if (err) console.log(err);
                cb(err, result);
            });
        });

    });
};

//添加动态评论
weiboMd.addWeiboComment = function(values, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into weibo_comment set ?',values, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};

module.exports = weiboMd;