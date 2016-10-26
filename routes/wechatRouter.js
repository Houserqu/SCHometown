var express = require('express');
var router = express.Router();

var wechatconfig = require("../config/wechat");
//var sha1 = require("../config/sha1");
var pool = require("../config/mysql");


//检验signature
router.get('/responMsg',function (req, res, next) {
    var signature = req.params.signature;

    var timestamp = req.params.timestamp;
    var nonce = req.params.nonce;
    var echostr = req.params.echostr;

    console.log(echostr);

    // var arr = [wechatconfig.Token, timestamp, nonce];
    // arr.sort();
    //
    // var str = arr[0] + arr[1] + arr[2];
    //
    // if(signature == sha1(str)){
    //     res.send(echostr)
    // }
    res.send(true);


});

module.exports = router;