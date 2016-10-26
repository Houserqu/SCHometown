var express = require('express');
var router = express.Router();

var wechatconfig = require("../config/wechat");
var pool = require("../config/mysql");


//检验signature
router.get('/',function (req, res, next) {

});

module.exports = router;