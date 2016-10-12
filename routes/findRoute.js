var express = require('express');
var router = express.Router();

/* GET find page. */
router.get('/', function(req, res, next) {
    res.render('find', { title: '发现' });
});

module.exports = router;