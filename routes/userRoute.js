var express = require('express');
var router = express.Router();
var userMd = require('../model/userModel');
var hometown = require('../model/hometownModel');

//查看个人信息
router.get('/myinfo', function (req, res, next) {
    userMd.getUserView(req.session.lastpage.userid, function (err, user) {
        res.render('myinfo', {user: user[0]});
    });
});

//修改user信息
router.post('/updateuser', function (req, res, next) {
    userMd.updateUser(req.session.lastpage.userid, req.body.column, req.body.value, function (err, user) {
        if (err) console.log(err);
        res.json({state: user});
    });
});

//修改userinfo信息
router.post('/updateuserinfo', function (req, res, next) {
    userMd.updateUserinfo(req.session.lastpage.userid, req.body.column, req.body.value, function (err, user) {
        if (err) console.log(err);
        res.json({state: user});
    });
});

//添加学校,家乡省市信息页面
router.get('/basicinfo', function (req, res, next) {
    userMd.getUserinfo(req.session.lastpage.userid, function (err, userinfo) {
        if (userinfo[0].basicmodify == 1 || userinfo[0].homeprovinceid == 0 || userinfo[0].homecityid == 0) {
            hometown.getMedia(req.session.lastpage.media_id, function (err, result) {
                res.render('basicinfo',{media:result[0]});
            });
        } else {
            res.redirect('/');
        }
    });
});

//修改userinfo家乡省份城市信息
router.post('/updateuserhometown', function (req, res, next) {
    userMd.updateUserHometown(req.session.lastpage.userid, req.body.pid, req.body.city, function (err, result) {
        if (err) console.log(err);
        if(result.affectedRows == 1){
            userMd.getUserView(req.session.lastpage.userid, function (err, userinfo) {
                if (err) console.log(err);
                logindata = {
                    openid: userinfo[0].openid,
                    userid: userinfo[0].userid,
                    nickname: userinfo[0].nickname,
                    headimgurl: userinfo[0].headimgurl,
                    homeprovinceid: userinfo[0].homeprovinceid,
                    media_id: userinfo[0].media_id
                };
                req.session.lastpage = logindata;
                res.cookie('logindata', logindata, {maxAge : 2592000}); //设置cookie

                res.json({state: result.affectedRows});
            });
        }
    });
});

//修改确认基本信息
router.post('/confirmbasicinfo', function (req, res, next) {
    userMd.getUserinfo(req.session.lastpage.userid, function (err, isallow) {   //判断是否有权限修改
        if (isallow[0].basicmodify == 0) {
            res.send({state: 0})
        } else {
            userMd.updateUserinfo(req.session.lastpage.userid, req.body.column, req.body.value, function (err, user) {
                if (err) {
                    res.send({state: 0})
                } else {
                    userMd.getUserView(req.session.lastpage.userid, function (err, userinfo) {
                        if (err) console.log(err);
                        console.log(userinfo[0]);
                        logindata = {
                            openid: userinfo[0].openid,
                            userid: userinfo[0].userid,
                            nickname: userinfo[0].nickname,
                            headimgurl: userinfo[0].headimgurl,
                            homeprovinceid: userinfo[0].homeprovinceid,
                            media_id: userinfo[0].media_id
                        };
                        req.session.lastpage = logindata;
                        res.cookie('logindata', logindata, {maxAge : 2592000}); //设置cookie
                        res.send({state: 1});
                    });
                }
            });
        }
    });
});

//修改userinfo学校信息
router.post('/updateuserschool', function (req, res, next) {
    userMd.updateUserSchool(req.session.lastpage.userid, req.body.pid, req.body.sid, function (err, result) {
        if (err) console.log(err);
        res.json({state: result.affectedRows});
    });
});

//显示自己发起的活动
router.get('/myactivitys', function (req, res) {
    userMd.getMyActivitys(req.session.lastpage.userid, function (err, activitys) {
        if (err) console.log(err);
        activitys.type = "我发起的活动";
        res.render("myactivitys", {activitys: activitys})
    });
});

//显示自己参与的活动
router.get('/myjoinactivitys', function (req, res) {
    userMd.getMyJoinActivitys(req.session.lastpage.userid, function (err, activitys) {
        if (err) console.log(err);
        activitys.type = "我参与的活动";
        res.render("myactivitys", {activitys: activitys})
    });
});

//显示自己关注的活动
router.get('/myfollowactivitys', function (req, res) {
    userMd.getFollowActivitys(req.session.lastpage.userid, function (err, activitys) {
        if (err) console.log(err);
        activitys.type = "我关注的活动";
        res.render("myactivitys", {activitys: activitys})
    });
});

module.exports = router;