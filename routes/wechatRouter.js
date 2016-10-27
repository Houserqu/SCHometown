var express = require('express');
var https = require("https");
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

    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx86caab40dba425ba&secret=d4624c36b6795d1d99dcf0547af5443d&code=" + code + "&grant_type=authorization_code"
    https.get(url, function (redata) {
        redata.on("data", function (d) {
            console.log(d);
            https.get("https://api.weixin.qq.com/sns/userinfo?access_token="+d.access_token+"&openid="+d.openid+"&lang=zh_CN ", function (info) {
                info.on("data",function (userinfo) {
                    console.log(userinfo);
                });
            });
        });
    }).on('error', function (e) {
        console.error(e);
    });
});

var getCode = function (qppid, encodeurl) {
    var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86caab40dba425ba&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
};
module.exports = router;