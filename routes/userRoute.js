var express = require('express');
var router = express.Router();
var userMd = require('../model/userModel');



//查看个人信息
router.get('/myinfo', function(req, res, next) {
    userMd.getUserinfo(req.session.lastpage.userid,function (err, user) {
        res.render('myinfo',{user:user[0]});
    });
});

//修改user信息
router.post('/updateuser', function(req, res, next) {
    userMd.updateUser(req.session.lastpage.userid, req.body.column, req.body.value, function (err, user) {
        if(err) console.log(err);
        res.json({state : user});
    });
});

//修改userinfo信息
router.post('/updateuserinfo', function(req, res, next) {
    userMd.updateUserinfo( req.session.lastpage.userid, req.body.column, req.body.value, function (err, user) {
        if(err) console.log(err);
        res.json({state : user});
    });
});

//显示自己发起的活动
router.get('/myactivitys', function (req, res) {
     userMd.getMyActivitys(req.session.lastpage.userid, function (err, activitys) {
         if(err) console.log(err);
         console.log(activitys);
         res.render("myactivitys", {activitys:activitys})
     });
});

//显示自己参与的活动
router.get('/myjoinactivitys', function (req, res) {
    userMd.getMyJoinActivitys(req.session.lastpage.userid, function (err, activitys) {
        if(err) console.log(err);
        console.log(activitys);
        res.render("myjoinactivitys", {activitys:activitys})
    });
});



module.exports = router;