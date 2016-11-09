var express = require('express');
var weiboMd = require('../model/weiboModel');
var userMd = require('../model/userModel');
var friendMd = require('../model/friendModel');
var router = express.Router();

/* GET friends page. */
router.get('/', function(req, res, next) {
    res.render('friends', { title: 'Friends' });
});


//查看好友主页
router.get('/goodfriendpage/:openid', function(req, res, next) {
    friendMd.getGoodFriendinfo(req.params.openid, function (err, user) {
        userMd.getUserWeibos(req.params.openid, function (err, weibolist) {
            if(err) console.log(err);

            res.render('goodfriendpage',{user:user[0],"weibolist":weibolist});
        });
    });
});

//查看乡友主页
router.get('/homefriendpage/:openid', function(req, res, next) {
    friendMd.getHomeFriendinfo(req.params.openid, function (err, user) {
        userMd.getUserWeibos(req.params.openid, function (err, weibolist) {
            friendMd.isGoodFriend(req.session.lastpage.userid, req.params.openid, function (err, isresult) {
                if(err) console.log(err);

                console.log("isfriend"+isresult);

                res.render('homefriendpage',{user:user[0],weibolist:weibolist,isfriend:isresult});

            });
        });
    });
});

//获取好友列表
router.get('/goodlist',function (req, res) {
    friendMd.getGoodFriends(req.session.lastpage.userid,function (err, friends) {
        if(err) console.log(err);
        if(friends)
            res.json({state:1,goodfriends:friends});
        else
            res.json({state:0});
    });
});

//获取乡友列表
router.get('/homelist',function (req, res) {
    friendMd.getHomeFriends(req.session.lastpage.media_id, req.session.lastpage.homeprovinceid, function (err, friends) {
        if(err) console.log(err);
        if(friends)
            res.json({state:1,homefriends:friends});
        else
            res.json({state:0});
    });
});

//获取好友动态
router.get('/weibolist',function (req, res) {
    weiboMd.getFriendsWeibolist(req.session.lastpage.userid, function (err, weibolist) {
        if(err) console.log(err);
        if(weibolist)
            res.json({state:1,weibolist:weibolist});
        else
            res.json({state:0});
    });
});

//添加关注好友
router.post("/addfriend", function (req, res) {
    friendMd.addFriend(req.session.lastpage.userid, req.body.friendid, function (err, result) {
        if(result)
            res.json({state:1});
        else
            res.json({state:0});
    });
});

//取消关注好友
router.post("/delfriend", function (req, res) {
    friendMd.delFriend(req.session.lastpage.userid, req.body.friendid, function (err, result) {
        if(result)
            res.json({state:1});
        else
            res.json({state:0});
    });
});

module.exports = router;