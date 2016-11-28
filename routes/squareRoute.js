var express = require('express');
var pool = require('../config/mysql');
var router = express.Router();
var activityMd = require('../model/activityModel');
var weiboMd = require('../model/weiboModel');
var hometownMd = require('../model/hometownModel');
var systemMd = require('../model/systemModel');
var mediaMd = require('../model/mediaModel');
var request = require('request');
var formidable = require("formidable");
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var COS = {
    APPID: '200001',
    secretID: 'AKIDUfLUEUigQiXqm7CVSspKJnuaiIKtxqAv',
    secretKey: 'bLcPnl88WU30VY57ipRhSePfPdOfSruK'
};

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req.session.lastpage);

    activityMd.getMediaActivitys(        //获取活动列表
        ['title', 'content', 'starttime', 'endtime', 'address', 'budget', 'content', 'userid', 'nickname', 'idactivity', 'headimgurl', 'origintime', 'provincename'],
        req.session.lastpage.media_id,
        0,
        5,
        function (err, activitys) {
            //获取老乡会信息
            hometownMd.getHometown(req.session.lastpage.media_id, req.session.lastpage.homeprovinceid, function (err, hometown) {
                //获取动态信息
                weiboMd.getMediaWeibolist(req.session.lastpage.media_id, function (err, hometownWeibo) {
                    console.log(hometownWeibo);
                    console.log(activitys);
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
    activityMd.getMediaActivitys(
        ['title', 'content', 'starttime', 'endtime', 'address', 'budget', 'content', 'userid', 'nickname', 'idactivity', 'provincename'],
        req.session.lastpage.media_id,
        0,
        30,
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
                        comments: comments,
                        user: {nickname: req.session.lastpage.nickname, headimgurl: req.session.lastpage.headimgurl}
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
        media_id: req.session.lastpage.media_id,
        homeprovinceid: req.session.lastpage.homeprovinceid
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
    var media_id = req.query.media_id;
    var provinceid = req.query.province;
    hometownMd.getHometown(media_id, provinceid, function (err, result) {
        hometownMd.getAcyivityNumber(media_id, provinceid, function (err, activitynumber) {
            hometownMd.getWeiboNumber(media_id, provinceid, function (err, weibonumber) {
                hometownMd.getHomeFriendsNumber(media_id, provinceid, function (err, homefriendsnumber) {
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
            if (err) console.log(err);
            res.render("weibodetail", {
                weibo: weibo[0],
                weibocomments: weibocomments,
                user: {nickname: req.session.lastpage.nickname, headimgurl: req.session.lastpage.headimgurl},
                squareFun: squareFun
            })
        });
    });
});

//动态图片上传
router.post("/upweiboimg", function (req, res) {
    var redatacode = 1;
    var form = new formidable.IncomingForm();

    form.uploadDir = path.join(__dirname, "../imgtmp");   //文件保存的临时目录为当前项目下的tmp文件夹
    form.maxFieldsSize = 4 * 1024 * 1024;  //用户头像大小限制为最大1M
    form.keepExtensions = true;        //使用文件的原扩展名

    form.parse(req, function (err, fields, files) {
        var redata = "";
        var targetDir = path.join(__dirname, "../upload/weiboimg");

        console.log(targetDir);

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

                console.log(targetFile);
                //
                // var t = Date.parse(new Date()) / 1000;
                // var e = t + 7776000;

                //var Original = "a=" + COS.APPID + "&b=newbucket&k=" + COS.secretID + "&e=" + e + "&t=" + t + "&r=382027881&f=";
                //var Original = 'a=200001&b=newbucket&k=AKIDUfLUEUigQiXqm7CVSspKJnuaiIKtxqAv&e=1437995704&t=1437995644&r=2081660421&f=';

                // var shasum = crypto.createHash('sha1');
                // shasum.update(Original);
                // var Signtmp = shasum.digest(COS.secretKey);
                //
                // var baee = crypto.createHash('base64');
                // var Sign = baee.update(Signtmp+Original);
                //
                // console.log(Sign);

                // var Sign = crypto.createHmac('sha1', COS.secretKey).update(Original).digest().toString('base64');
                // console.log(Sign);
                //
                // var options = {
                //     url: 'http://web.file.myqcloud.com/files/v1/' + COS.APPID + '/hometownimg/' + fileName,
                //     method: 'post',
                //     //'Content-Type' : 'multipart/form-data',
                //     headers: {
                //         'User-Agent': 'request',
                //         'content-type': 'multipart/form-data',
                //         Authorization: Sign
                //     },
                //     Authorization: Sign,
                //     form: {
                //         filecontent: fs.createReadStream('/Users/Houser/Documents/Web/WebStormProject/Hometown/upload/boardcast/swiper1.jpg'),
                //         op: 'upload'
                //     }
                // };
                //
                // request(options, function (err, httpResponse, body) {
                //     //console.log(httpResponse);
                //     console.log(body);
                // });

                // request.post({
                //         url: 'http://web.file.myqcloud.com/files/v1/' + COS.APPID + '/hometownimg/' + fileName,
                //         Authorization: Sign,
                //         formData: {
                //             op: 'upload',
                //             filecontent: fs.createReadStream('/Users/Houser/Documents/Web/WebStormProject/Hometown/upload/boardcast/swiper1.jpg')
                //         }
                //     },
                //     function optionalCallback(err, httpResponse, body) {
                //         console.log(httpResponse);
                //         console.log(body);
                //     });

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

//反馈页面
router.get('/feedback', function (req, res) {
    res.render("feedback");
});

//提交反馈
router.post('/submitfeedback', function (req, res) {
    console.log(req.body.content);
    systemMd.submitfeedback(req.session.lastpage.userid, req.body.content, function (err, result) {
        if (result.affectedRows > 0) {
            res.send({code: 200});
        } else {
            res.send({code: 0});
        }
    });

});

//公众号管理后台
router.get('/mediaadmin', function (req, res) {
    mediaMd.isExist(req.session.lastpage.media_id, function (err, isexist) {
        if (isexist.length > 0) {
            mediaMd.getAllUsers(req.session.lastpage.media_id, function (err, users) {

                mediaMd.getMediaAllActivitys(req.session.lastpage.media_id, function (err, acticitys) {

                    mediaMd.getMediaAllWeibos(req.session.lastpage.media_id, function (err, weibos) {

                        var activitynumber = acticitys.length;
                        var weibonumber = weibos.length;

                        res.render("mediaadmin", {users: users, activitynumber:activitynumber, weibonumber:weibonumber});
                    });
                })
            });
        } else {
            res.render("error", {message: '无公众号信息! 请重新开启应用', error: ''});
        }

    });
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
