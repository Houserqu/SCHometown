var express = require('express');
var https = require("https");
var router = express.Router();

var wechatconfig = require("../config/wechat");
var pool = require("../config/mysql");


router.get('/responMsg',function (req, res, next) {

});

router.get("/login",function (req, res, next) {
    var code = req.query.code;
    var state = req.query.state;

    console.log(code);

    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx86caab40dba425ba&secret=d4624c36b6795d1d99dcf0547af5443d&code="+code+"&grant_type=authorization_code"
    https.get(url, function (redata) {
        redata.on("data",function (data) {
            console.log(data);
            res.send(data);
        });
    });
});

var getCode = function (qppid, encodeurl) {
    var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86caab40dba425ba&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
};
module.exports = router;