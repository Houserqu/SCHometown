var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var square = require('./routes/squareRoute');
var find = require('./routes/findRoute');
var friends = require('./routes/friendsRoute');
var user = require('./routes/userRoute');
var findHometown = require('./routes/findHometownRouter');
var login = require('./routes/loginRouter');
var wechat = require('./routes/wechatRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'hometown', cookie: {maxAge: 360000}, resave: false, saveUninitialized: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));

//模拟登陆
// app.use(function (req, res, next) {
//     req.session.lastpage = {
//         media_id: 'gh_fe88fc5cdb42',
//         homeprovinceid: 13,
//         homecityid: '112',
//         userid: 21,
//         openid: 'o5spBwKz0CTyGMnD46DvRmgWuNIQ',
//         nickname: 'Houser',
//         headimgurl: 'http://wx.qlogo.cn/mmopen/Q3auHgzwzM4JOiah0vwJq6PmwvzYg4ZfSl1nI37F5HvlpPSJhaQB1BnLmpApSem1OhNuMYLHDYLwx6wg9nem7xic5ah6jaiaxCzBPFXtEvTFt8/0',
//         school_code: 946943942,
//         school_name: '北京大学',
//         introduction: null,
//         homeprovincename: '湖北',
//         homecityname: '黄冈市',
//         media_name: '程序缘',
//         phone: null,
//         wechatnumber: null,
//         sex: 1 };
//     next();
// });


//登录拦截
app.use(function (req, res, next) {
    if (req.session.lastpage) {
        next();
    } else {
        // 解析用户请求的路径
        var arr = req.url.split('/');
        // 去除 GET 请求路径上携带的参数
        for (var i = 0, length = arr.length; i < length; i++) {
            arr[i] = arr[i].split('?')[0];
        }

        if(arr.length > 2 && arr[1] == 'wechat' && (arr[2]=='login' || arr[2] == 'weixiao')){
            next();
        } else {  // 登录拦截
            res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx86caab40dba425ba&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');  // 将用户重定向到登录页面
        }
    }
});

app.use('/', square);
//app.use('/login', login);
app.use('/find', find);
app.use('/friends', friends);
app.use('/user', user);
app.use('/wechat', wechat);
app.use('/find/hometown', findHometown);  //发现-校乡汇模块

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
