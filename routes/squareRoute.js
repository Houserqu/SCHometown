var express = require('express');
var pool = require('../config/mysql');
var router = express.Router();
var activityMd = require('../model/activityModel');
var weiboMd = require('../model/weiboModel');
var hometownMd = require('../model/hometownModel');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs');


/* GET home page. */
router.get('/', function (req, res, next) {
    activityMd.getActivitys(        //获取活动列表
        ['title', 'content', 'starttime', 'endtime', 'address', 'budget', 'content', 'userid', 'nickname', 'idactivity', 'headimgurl', 'origintime'],
        req.session.lastpage.schoolid,
        req.session.lastpage.provinceid,
        0,
        5,
        function (err, activitys) {
            //获取老乡会信息
            hometownMd.getHometown(req.session.lastpage.schoolid, req.session.lastpage.provinceid, function (err, hometown) {
                //获取动态信息
                weiboMd.getHometownWeibolist(req.session.lastpage.schoolid, req.session.lastpage.provinceid, function (err, hometownWeibo) {
                    if (err) console.log(err);
                    var list = hometownWeibo.concat(activitys);

                    list.sort(function (a, b) {
                        return new Date(a.origintime).getTime() < new Date(b.origintime).getTime() ? 1 : -1;
                    });
                    res.render('square', {
                        list: list,
                        user: req.session.lastpage,
                        hometown: hometown,
                        squareFun: squareFun
                    });
                });

            });
        });
});

//所有活动列表
router.get('/activitys', function (req, res, next) {
    activityMd.getActivitys(
        ['title', 'content', 'starttime', 'endtime', 'address', 'budget', 'content', 'userid', 'nickname', 'idactivity'],
        req.session.lastpage.schoolid,
        req.session.lastpage.provinceid,
        0,
        10,
        function (err, results) {

            res.render('activitys', {activitys: results});
        });
});

//活动详情页
router.get('/activitydetail/:id', function (req, res, next) {
    //获取活动详情
    activityMd.getOneActivity(req.params.id, function (err, activitydetail) {
        //获取参与人
        activityMd.getActivityJoins(req.params.id, function (err, joiners) {
            //判断当前用户是否参与活动
            for (var i = 0; i < joiners.length; i++) {
                if (joiners[i].userid == req.session.lastpage.userid) {
                    activitydetail[0].isjoin = 1;
                    break;
                }
            }
            //获取活动关注用户
            activityMd.getActivityFollows(req.params.id, function (err, follows) {
                //判断当前用户是否参与活动
                for (var i = 0; i < follows.length; i++) {
                    if (follows[i].userid == req.session.lastpage.userid) {
                        activitydetail[0].isfollow = 1;
                        break;
                    }
                }
                //获取评论
                activityMd.getActivityComments(req.params.id, function (err, comments) {
                    res.render('activitydetail', {
                        activitydetail: activitydetail,
                        joiners: joiners,
                        follows: follows,
                        comments: comments
                    });
                });
            });
        });
    });
});

//显示活动参与者列表
router.get('/activitydetail/joinerlist/:id', function (req, res) {
    activityMd.getActivityJoins(req.params.id, function (err, joiners) {
        res.render('joinerlist', {joiners: joiners});
    });
});

//参与、不参与
router.post('/activitydetail/dojoin', function (req, res) {
    if (req.body.state == '1') {
        activityMd.doJoinIn({
            userid: req.session.lastpage.userid,
            idactivity: req.body.idactivity,
            nickname: req.session.lastpage.nickname
        }, function (err, result) {
            if (result)
                res.json({state: 1, label: '参与'});
            else {
                res.json({state: 0, label: '不参与'});
            }
        });
    } else {
        activityMd.doJoinOut(req.session.lastpage.userid, req.body.idactivity, function (err, result) {
            if (result)
                res.json({state: 1, label: '不参与'});
            else {
                res.json({state: 0, label: '参与'});
            }
        });
    }
});

//显示活动关注者列表
router.get('/activitydetail/followlist/:id', function (req, res) {
    activityMd.getActivityFollows(req.params.id, function (err, follows) {
        res.render('followlist', {follows: follows});
    });
});

//关注、取消关注
router.post('/activitydetail/dofollow', function (req, res) {
    if (req.body.state == '1') {
        activityMd.doFollowIn({
            userid: req.session.lastpage.userid,
            idactivity: req.body.idactivity
        }, function (err, result) {
            if (result)
                res.json({state: 1, label: '关注'});
            else {
                res.json({state: 0, label: '不关注'});
            }
        });
    } else {
        activityMd.doFollowOut(req.session.lastpage.userid, req.body.idactivity, function (err, result) {
            if (result)
                res.json({state: 1, label: '不关注'});
            else {
                res.json({state: 0, label: '关注'});
            }
        });
    }
});

//添加活动评论
router.post('/addactivitycomment', function (req, res) {
    activityMd.addActivityComment({
            idactivity: req.body.idactivity,
            content: req.body.comment,
            userid: req.session.lastpage.userid
        },
        function (err, result) {
            if (result.affectedRows)
                res.json({state: 1});
            else res.json({state: 0});
        });

});

/* 发布活动页面 */
router.get('/addactivity', function (req, res, next) {
    res.render('addactivity');
});


/* 活动编辑页面  暂时不允许重新编辑活动,后期考虑  AJAX写库暂未完成*/
// router.get('/editactivity/:activity',function (req,res,next) {
//     if(req.session.lastpage.openid == "" || req.session.lastpage.userid == "")
//         res.redirect("/");
//     squareMd.getOneActivity(req.params.activity, function (err, result) {
//         console.log(result);
//         res.render('editactivity', {activity:result});
//     });
//
// });

/* 活动 submit */
router.post('/editactivity/add', function (req, res, next) {
    var activity = {
        title: req.body.title,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        address: req.body.address,
        budget: req.body.budget,
        content: req.body.content,
        userid: req.session.lastpage.userid,
        schoolid: req.session.lastpage.schoolid,
        provinceid: req.session.lastpage.provinceid
    };
    if (activity.title != '' && activity.starttime != '' && activity.content != '') {
        activityMd.addActivity(activity, function (err, result) {
            if (err) console.log(err);

            if (result.affectedRows)
                res.json({isadd: 1});      //Ajax  用 res.json 返回
            else
                res.json({isadd: 0});
        });
    } else {
        res.json({isadd: 0});
    }
});

//发布动态页面
router.get('/addweibo', function (req, res) {
    res.render("addweibo");
});

//老乡会主页
router.get('/schometown', function (req, res, next) {
    var schoolid = req.query.school;
    var provinceid = req.query.province;
    hometownMd.getHometown(schoolid, provinceid, function (err, result) {
        hometownMd.getAcyivityNumber(schoolid, provinceid, function (err, activitynumber) {
            hometownMd.getWeiboNumber(schoolid, provinceid, function (err, weibonumber) {
                hometownMd.getHomeFriendsNumber(schoolid, provinceid, function (err, homefriendsnumber) {
                    if (err) console.log(err);
                    result.activitynumber = activitynumber;
                    result.weibonumber = weibonumber;
                    result.homefriendsnumber = homefriendsnumber;
                    res.render("schometownpage", {schometown: result});
                });
            });
        });
    });
});

//发布动态
router.post("/doaddweibo", function (req, res) {
    weiboMd.addWeibo({
            content: req.body.content,
            imgurl: req.body.imgurls,
            userid: req.session.lastpage.userid,
            praise: 10
        },
        function (err, result) {
            res.json({code: result.affectedRows});
        });

});

//动态详情
router.get("/weibodetail/:wid", function (req, res) {
    var wid = req.params.wid;
    weiboMd.getOneWeibo(wid, function (err, weibo) {
        weiboMd.getWeiboComment(wid, function (err, weibocomments) {
            if(err) console.log(err);
            console.log(weibo);
            console.log(weibocomments);
            res.render("weibodetail", {weibo: weibo[0], weibocomments:weibocomments, squareFun: squareFun})
        });
    });
});

//动态图片上传
router.post("/upweiboimg", function (req, res) {
    var redatacode = 1;
    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(__dirname, "../imgtmp");   //文件保存的临时目录为当前项目下的tmp文件夹
    form.maxFieldsSize = 2 * 1024 * 1024;  //用户头像大小限制为最大1M
    form.keepExtensions = true;        //使用文件的原扩展名

    form.parse(req, function (err, fields, files) {
        var redata = "";
        var targetDir = path.join(__dirname, "../upload/weiboimg");

        if (err) throw err;
        var filesUrl = "";
        var keys = Object.keys(files);
        keys.forEach(function (key) {
            var filePath = files[key].path;
            var fileExt = filePath.substring(filePath.lastIndexOf('.'));
            if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
                redatacode = 0;
            } else {
                //以当前时间戳对上传文件进行重命名
                var fileName = new Date().getTime() + fileExt;
                var targetFile = path.join(targetDir, fileName);
                //移动文件
                fs.renameSync(filePath, targetFile);
                // 文件的Url（相对路径）
                filesUrl += fileName + "||";
            }
        });

        if (redatacode == 0) {
            res.json({code: 0, info: "图片错误"});
        } else {
            res.json({code: 1, info: filesUrl});

        }
    });

});

//添加活动评论
router.post('/addweibocomment', function (req, res) {
    weiboMd.addWeiboComment({
            weiboid: req.body.weiboid,
            content: req.body.comment,
            userid: req.session.lastpage.userid
        },
        function (err, result) {
            if (result.affectedRows)
                res.json({state: 1});
            else res.json({state: 0});
        });
});


/* 登录 */
router.get('/login', function (req, res, next) {
    req.body = {
        'openid': 'awasdwgzqwetyt12312qsed',
        'userid': '1',
        'schooldid': '0001',
        'provinceid': '0002',
        'realname': '杨过'
    };
    req.session.lastpage = req.body;//写入至session
    res.redirect('/');
});

/*登录页 接入微信登录后删除*/
router.get('/loginpage', function (req, res, next) {
    res.render('loginpage');
});

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

//计算指定时间到今天0点的差值
Date.prototype.reverseTime = function reverseTime() {
    var reversetime = "";
    var timeDifference = new Date(new Date().toLocaleDateString()).getTime() - this.getTime();

    if (timeDifference > 0) {   //如果为正  用天计算
        var weibotime = this.getHours();  //发布时间(小时)
        var timeDays = timeDifference / 86400000;        //距当前天数
        if (timeDays < 1) {
            reversetime = "昨天 " + weibotime + "点";
        } else {
            reversetime = Math.floor(timeDays) + "天前 " + weibotime + "点";
        }
    } else {  //差值为负   用小时做单位

        //计算指定时间到现在时间的小时差值
        var timeHours = (new Date().getTime() - this.getTime()) / 86400000 * 24;
        if (timeHours < 1) {
            reversetime = "刚刚";
        } else {
            reversetime = Math.floor(timeHours) + "小时前";
        }
    }
    return reversetime;
};

var squareFun = function () {
};

squareFun.imgs = function (imgstr) {
    var imgs = Array();
    if (imgstr != "" && imgstr != null) {
        imgs = imgstr.split("||");
        imgs.pop();
    }
    return imgs;
};

module.exports = router;
