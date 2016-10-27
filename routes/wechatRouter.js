var express = require('express');
var request = require("request");
var router = express.Router();

var wechatconfig = require("../config/wechat");
var pool = require("../config/mysql");


router.get('/responMsg', function (req, res, next) {

});

router.get("/login", function (req, res, next) {
    var code = req.query.code;
    var state = req.query.state;

    console.log("code:" + code);
    console.log("state:" + state);

    //微信获取用户资料第二步通过code换取网页授权access_token
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx86caab40dba425ba&secret=d4624c36b6795d1d99dcf0547af5443d&code=" + code + "&grant_type=authorization_code"
    request.get({url:url ,form:{}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            var jsondata = JSON.parse(body);

            //第四步拉取用户信息(需scope为 snsapi_userinfo)
            request.get({url:"https://api.weixin.qq.com/sns/userinfo?access_token="+jsondata.access_token+"&openid="+jsondata.openid+"&lang=zh_CN ",form:{}}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var userdata = JSON.parse(body);
                    console.log(userdata);
                    res.end(JSON.stringify(userdata));
                }else{
                    res.end("get userinfo error");
                }
            });
        }else{
            res.end("get access_token error");
        }
    });
});

var getCode = function (qppid, encodeurl) {
    var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86caab40dba425ba&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
};
module.exports = router;