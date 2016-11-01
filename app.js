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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'hometown',cookie: {maxAge: 360000 },resave:false,saveUninitialized:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));

//登录拦截
/*app.use(function (req, res, next) {
  if(!req.session.lastpage) {

    var url = req.originalUrl;

    if (url != "/loginpage" && url != "/login") {
      return res.redirect("/loginpage");
    }
  }
  next();
});*/
//
// app.use(function (req, res, next) {
//     var usersession = {openid:'olAdmuKBW_YPTnjjx1wf_bvkjLao',userid:1,schoolid:1305,provinceid:13,nickname:'Houser',headimgurl:'/headimg/default.jpg', introduction:"技术与艺术"};
//     req.session.lastpage = usersession;//写入至session
//     next();
// });

app.use('/', square);
//app.use('/login', login);
app.use('/find', find);
app.use('/friends', friends);
app.use('/user', user);
app.use('/wechat', wechat);
app.use('/find/hometown', findHometown);  //发现-校乡汇模块

/*app.get('/login',function (req,res) {
  if(req.session.lastPage) {
    console.log('Last page was: ' + req.session.lastPage + ".");
  }
  req.session.lastPage = {'schoolid':'123','proviceid':'123'}; //每一次访问时，session对象的lastPage会自动的保存或更新内存中的session中去。
  res.send("You're Awesome. And the session expired time is: " + req.session.cookie.maxAge);
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
