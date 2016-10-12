var express = require('express');
var weiboMd = require('../model/weiboModel');
var userMd = require('../model/userModel');
var router = express.Router();

/* GET friends page. */
router.get('/', function(req, res, next) {
    res.render('friends', { title: 'Friends' });
});

//获取好友
router.get('/goodlist',function (req, res) {
    userMd.getGoodFriends(req.session.lastpage.userid,function (err, friends) {
        if(err) console.log(err);
        console.log(friends);
        if(friends)
            res.json({state:1,goodfriends:friends});
        else
            res.json({state:0});
    });
});

//获取乡友
router.get('/homelist',function (req, res) {
    userMd.getHomeFriends(req.session.lastpage.schoolid, req.session.lastpage.provinceid, function (err, friends) {
        if(err) console.log(err);
        console.log(friends);
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
        console.log(weibolist);
        if(weibolist)
            res.json({state:1,weibolist:weibolist});
        else
            res.json({state:0});
    });
});

module.exports = router;