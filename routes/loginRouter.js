var pool = require("../config/mysql");
var wechatconfig = require("../config/wechat");
var sha1 = require("../config/sha1");

var router = express.Router();

//检验signature
router.get('/checkSignature',function (req, res, next) {
    var signature = req.params.signature;

    var timestamp = req.params.timestamp;
    var nonce = req.params.nonce;
    var echostr = req.params.echostr;

    var arr = [wechatconfig.Token, timestamp, nonce];
    arr.sort();

    var str = arr[0] + arr[1] + arr[2];

    if(signature == hex_sha1(str)){
        res.send(echostr)
    }


});

module.exports = router;