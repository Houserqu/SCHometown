var pool = require("../config/mysql");

var activityMd = function () { };

//获取老乡会活动列表 (需要获取的字段, 学校id , 身份id)
activityMd.getActivitys = function(columns, schoolid, provinceid, limitstart, limitend, cb ){
    pool.getConnection(function (err, conn) {
        if (err) throw err;

        conn.query("select ?? from activity_view where schoolid = ? and provinceid = ? limit ?,?", [columns, schoolid, provinceid, limitstart, limitend], function (err, results) {
            conn.release();     //释放连接,让连接返回到连接池
            if(err) console.log(err);
            cb(err, results);
        });
    });
};

//添加活动
activityMd.addActivity = function (values,cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;

        conn.query("insert into activity set ? ",values, function (err, results) {
            conn.release();     //释放连接,让连接返回到连接池
            if(err) throw err;
            cb(err, results);
        });
    });
};

activityMd.editActivity = function () {

};

//获取一个活动
activityMd.getOneActivity = function (idactivivty,cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("select * from activity_view where idactivity = ?", idactivivty, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//参与活动
activityMd.doJoinIn = function (values,cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("insert into activity_join set ?", values, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//取消参与活动
activityMd.doJoinOut = function (userid, idactivity, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        console.log(userid);
        conn.query("delete from activity_join where userid = "+userid+" and idactivity = " +idactivity, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//关注活动
activityMd.doFollowIn = function (values,cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        conn.query("insert into activity_follow set ?", values, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//取消关注
activityMd.doFollowOut = function (userid, idactivity, cb) {
    pool.getConnection(function (err,conn) {
        if(err) throw err;
        console.log(userid);
        conn.query("delete from activity_follow where userid = "+userid+" and idactivity = " +idactivity, function (err,result) {
            conn.release();
            if(err) console.log(err);
            cb(err,result);
        });
    });
};

//获取活动参与人
activityMd.getActivityJoins = function (idactivivty,cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from activity_join_view where idactivity = ?',idactivivty, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};

//获取活动关注
activityMd.getActivityFollows = function (idavtivivty,cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from activity_follow_view where idactivity = ?',idavtivivty, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};



//获取活动评论
activityMd.getActivityComments = function (idavtivivty, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from activity_comment_view where idactivity = ? order by time desc limit 30',idavtivivty, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};

//添加活动评论
activityMd.addActivityComment = function(values, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into activity_comment set ?',values, function (err,results) {
            conn.release();
            if(err) throw err;
            cb(err, results);
        });
    });
};


module.exports = activityMd;