/*
发现栏目:校乡汇
功能: 浏览其他本校老乡会
     其他学校老乡会
 */

var express = require('express');
var router = express.Router();

router.get("/", function (req, res ) {
    res.send("hometown");
});

module.exports = router;


