var express = require('express');
var request = require("request");
var md5 = require("md5");
var pool = require("../config/mysql");

var router = express.Router();

var wechatconfig = {
    appid:"wx43e92e841f4bfcc1",
    appsecret:"c966f8621441ba80261bfaf8aad0849d",
    Token:"houser",
    ApiSecret:"7B36DF4C1E8F184BBDC6D5AA3A15DDB3",   //微校
    ApiKey:"88CD15FA61E0C03B"
};

router.get('/responMsg', function (req, res, next) {

});

router.get("/login", function (req, res, next) {
    var code = req.query.code;
    console.log(code);
    //判断是否是微信服务器发送的请求
    // if(!code){
    //     res.render("error",{error:"错误",message:"直接访问或者微信服务器错误,"});
    // }

    //获取accesstoken
    getAccessToken(wechatconfig.appid, wechatconfig.appsecret,code,function (err, accesstoken) {
        console.log(accesstoken);
        userExist(accesstoken.openid, function (err, result) {  //判断用户是否存在
            //存在,写入session
            if(result.length > 0){
                req.session.lastpage = {
                    openid:result[0].openid,
                    userid:result[0].userid,
                    nickname:result[0].nickname,
                    headimgurl:result[0].headimgurl,
                    schoolid:result[0].schoolid,
                    provinceid:result[0].homeprovinceid
                };

                res.redirect("/");
            }else{
                console.log("不存在,拉取用户信息");
                //拉取用户信息
                getUserinfo(accesstoken.access_token, accesstoken.openid,function (err, getuserinfo) {
                    console.log(getuserinfo);
                    if(getuserinfo.hasOwnProperty("errcode")){
                        res.send("登录失败")
                    }else{

                        getuserinfo.privilege = getuserinfo.privilege.toString();
                        addUser(getuserinfo, function (err, isadd) {   //添加新用户
                            console.log(isadd);
                            if(err) {
                                console.log(err);
                                res.send("登录失败");

                            } else {
                                addUserinfo({userid: isadd.insertId},function (err, userinfo) {  //添加新userinfo

                                    if(userinfo.affectedRows > 0) {
                                        req.session.lastpage = {
                                            openid: getuserinfo.openid,
                                            userid: isadd.insertId,
                                            nickname: getuserinfo.nickname,
                                            headimgurl: getuserinfo.headimgurl
                                        };

                                        res.redirect("/user/basicinfo");
                                    }
                                    else
                                        res.send("error");
                                });

                            }
                        });
                    }
                });
            }
        });

    });
});

//微校配置
router.all("/weixiao",function (req, res, next) {
    var type = req.query.type;
    var postdata = req.body;

    console.log(type);
    console.log(postdata);

    switch (type){
        case 'open' :
            weixiaoopen(postdata,req,res); break;
        case 'close' :
            weixiaoclose(postdata,req,res); break;
        case 'config' :
            weixiaoconfig(postdata,req,res); break;
        case 'monitor' :
            weixiaomonitor(postdata,req,res); break;
        case 'trigger' :
            weixiaotrigger(postdata,req,res); break;
        default :
             break;
    }
});

//将微校post处理为json
function tojson(postdata) {
    var jsonstr;
    for(var key in postdata){
        jsonstr = key;
    }
    return JSON.parse(jsonstr);
}

//微校应用开启
function weixiaoopen(postdata,req,res) {
    var jsondata = tojson(postdata);    //处理获取的json

    //保存公众信息
    getmedia(jsondata,function (err,mediainfo) {
        if(!mediainfo.hasOwnProperty("errcode")){

            pool.getConnection(function (err, conn) {

                if(err) console.log( err);
                conn.query('select * from media where media_id = ?',mediainfo.media_id, function (err,result) {
                    if(err) console.log( err);
                    if(result.affectedRows < 1){
                        conn.query('insert into media set ?',mediainfo, function (err, isadd) {
                            if(err) console.log( err);
                        });
                    }
                });
            });
        }
    });

    var sign = jsondata.sign;
    delete jsondata.sign;

    var calsign = calSign(jsondata);

    if(sign == calsign){
        var interval = Date.parse(new Date()) - jsondata.timestamp*1000;
        if(interval < 600000){
            res.send({"errcode":0, "errmsg":"开启成功", "is_config":0});
        }else {
            res.send({"errcode":1, "errmsg":"超时", "is_config":0});
        }
    }else{
        res.send({"errcode":1, "errmsg":"签名错误", "is_config":0});
    }

}

//微校应用关闭
function weixiaoclose(postdata,req,res) {
    var sign = postdata.sign;
    delete postdata.sign;

    var calsign = calSign(postdata)

    if(sign == calsign){
        var interval = Date.parse(new Date()) - postdata.timestamp*1000;
        if(interval < 600000){
            res.send({"errcode":0, "errmsg":"OK"});
        }else {
            res.send({"errcode":1, "errmsg":"超时"});
        }
    }else{
        res.send({"errcode":1, "errmsg":"签名错误"});
    }
}

//微校应用配置
function weixiaoconfig(postdata,req,res) {
    
}

//微校应用监控
function weixiaomonitor(postdata,req,res) {
    res.send(req.jquery.echostr);
}

//微校应用触发
function weixiaotrigger(postdata,req,res) {
    var requertjson = {
        media_id: req.query.media_id,
        api_key:wechatconfig.ApiKey
    };

    console.log(req.query.media_id);
    console.log("trigger");
    res.redirect(url);
}

//获取公众号信息
function getmedia(postdata,cb) {
    var url = "http://weixiao.qq.com/common/get_media_info";
    console.log(url);
    request.post({url:url ,form:postdata}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var mediadinfo = JSON.parse(body);
            console.log(mediadinfo);
            cb(error, mediadinfo);
        }
    });
}

//签名算法
function calSign(jsondata) {
    var keyarray = [];

    for(var key in jsondata){
        keyarray.push(key);
    }
    keyarray.sort();

    var stringA = "";
    keyarray.forEach(function (key) {
        stringA += key+"="+jsondata[key]+"&";
    });

    stringA += "key="+wechatconfig.ApiSecret;
    var signValue = md5(stringA);

    return signValue.toUpperCase();
}

//添加用户
var addUser = function (value, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into user set ?',value, function (err,result) {
            conn.release();
            if(err) throw err;
            cb(err, result);
        });
    });
};

//添加用户信息
var addUserinfo = function (value, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('insert into userinfo set ?',value, function (err,result) {
            conn.release();
            if(err) throw err;
            cb(err, result);
        });
    });
};

var userExist = function (openid, cb) {
    pool.getConnection(function (err, conn) {
        if(err) throw err;
        conn.query('select * from user_view where openid = ?',openid, function (err,result) {
            conn.release();
            if(err) throw err;
            console.log(result);
            cb(err, result);
        });
    });
};
var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+wechatconfig.appid+"&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect"

//通过code换取网页授权access_token
var getAccessToken = function (appid, secret, code, cb) {
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid="+appid+"&secret="+secret+"&code=" + code + "&grant_type=authorization_code"
    request.get({url:url ,form:{}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsondata = JSON.parse(body);
            cb(error, jsondata);
        }
    });
};

//通过access_token拉取用户信息
var getUserinfo = function (access_token, openid, cb) {
    request.get({url:"https://api.weixin.qq.com/sns/userinfo?access_token="+access_token+"&openid="+openid+"&lang=zh_CN ",form:{}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var userinfo = JSON.parse(body);
            cb(error, userinfo);
        }
    });
};


module.exports = router;