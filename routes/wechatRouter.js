var express = require('express');
var request = require("request");
var pool = require("../config/mysql");

var router = express.Router();

var wechatconfig = {
    appid:"wx86caab40dba425ba",
    appsecret:"d4624c36b6795d1d99dcf0547af5443d",
    Token:"houser"
}

router.get('/responMsg', function (req, res, next) {

});

router.get("/login", function (req, res, next) {
    var code = req.query.code;

    getAccessToken(wechatconfig.appid, wechatconfig.appsecret,code,function (err, accesstoken) {
        userExist(accesstoken.openid, function (err, result) {  //判断用户是否存在
            if(result){
                res.redirect("/");
            }else{
                getUserinfo(accesstoken.access_token, accesstoken.openid,function (err, userinfo) {
                    console.log(userinfo);
                    if(userinfo.hasOwnProperty("errcode")){
                        res.send("登录失败")
                    }else{
                        addUserinfo(userinfo, function (err, isadd) {
                            if(err || isadd) {
                                console.log(err);
                                res.send("登录失败");
                            } else {
                                res.redirect("/");
                            }
                        });
                    }
                });
            }
        });

    });
});

var addUserinfo = function (value, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into user set ?',value, function (err,result) {
            conn.release();
            if(err) throw err;
            if(result.affectedRows){
                cb(err, 1);
            }else{
                cb(err, 0);
            }
        });
    });
};

var userExist = function (openid, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from user where openid = ?',openid, function (err,result) {
            conn.release();
            if(err) throw err;
            if(result[0].affectedRows){
                cb(err, 1);
            }else{
                cb(err, 0);
            }
        });
    });
}
var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86caab40dba425ba&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"

//通过code换取网页授权access_token
var getAccessToken = function (appid, secret, code, cb) {
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+appid+"&secret="+secret+"&code=" + code + "&grant_type=authorization_code"
    request.get({url:url ,form:{}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsondata = JSON.parse(body);
            cb(error, jsondata);
        }
    });
};

//通过access_token拉取用户信息
var getUserinfo = function (access_token, openid, cb) {
    request.get({url:"https://api.weixin.qq.com/sns/userinfo?access_token="+access_token+"&openid="+openid+"&lang=zh_CN ",form:{}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var userinfo = JSON.parse(body);
            cb(error, userinfo);
        }
    });
};
module.exports = router;