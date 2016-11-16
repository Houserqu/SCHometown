var express = require('express');
var request = require("request");
var cookieParser = require('cookie-parser');
var md5 = require("md5");
var pool = require("../config/mysql");

var router = express.Router();

var wechatconfig = {
    appid: "wx43e92e841f4bfcc1",
    appsecret: "c966f8621441ba80261bfaf8aad0849d",
    Token: "houser",
    ApiSecret: "7B36DF4C1E8F184BBDC6D5AA3A15DDB3",   //微校
    ApiKey: "88CD15FA61E0C03B"
};

router.get('/responMsg', function (req, res, next) {

});

router.get("/login", function (req, res, next) {
    var code = req.query.code;
    console.log("code:"+code);

    //判断是否是微信服务器发送的请求
    if(!code){
        res.render("error",{message:"非法访问或者微信服务器错误,",error:""});
    }else{
        //获取accesstoken
        getAccessToken(wechatconfig.appid, wechatconfig.appsecret, code, function (err, accesstoken) {
            userExist(accesstoken.openid, req.session.media_id, function (err, result) {  //判断用户是否存在
                //存在,写入session
                if (result.length > 0) {
                    req.session.lastpage = {
                        openid: result[0].openid,
                        userid: result[0].userid,
                        nickname: result[0].nickname,
                        headimgurl: result[0].headimgurl,
                        schoolid: result[0].schoolid,
                        homeprovinceid: result[0].homeprovinceid,
                        media_id:result[0].media_id
                    };

                    res.redirect("/");
                } else {
                    //拉取用户信息
                    getUserinfo(accesstoken.access_token, accesstoken.openid, function (err, getuserinfo) {
                        if (getuserinfo.hasOwnProperty("errcode")) {
                            res.send("登录失败")
                        } else {

                            getuserinfo.privilege = getuserinfo.privilege.toString();
                            addUser(getuserinfo, function (err, isadd) {   //添加新用户
                                console.log(isadd);
                                if (err) {
                                    console.log(err);
                                    res.send("登录失败");

                                } else {
                                    addUserinfo({userid: isadd.insertId, media_id: req.session.media_id}, function (err, userinfo) {  //添加新userinfo

                                        if (userinfo.affectedRows > 0) {
                                            req.session.lastpage = {
                                                openid: getuserinfo.openid,
                                                userid: isadd.insertId,
                                                nickname: getuserinfo.nickname,
                                                headimgurl: getuserinfo.headimgurl,
                                                media_id: req.session.media_id
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
    }


});

//微校配置
router.all("/weixiao", function (req, res, next) {
    var type = req.query.type;
    var postdata = req.body;

    console.log(type);
    console.log(postdata);

    switch (type) {
        case 'open' :
            weixiaoopen(postdata, req, res);
            break;
        case 'close' :
            weixiaoclose(postdata, req, res);
            break;
        case 'config' :
            weixiaoconfig(postdata, req, res);
            break;
        case 'monitor' :
            weixiaomonitor(postdata, req, res);
            break;
        case 'trigger' :
            weixiaotrigger(postdata, req, res);
            break;
        default :
            break;
    }
});

//将微校post处理为json
function tojson(postdata) {
    if (postdata == null)
        return {};

    var jsonstr;
    for (var key in postdata) {
        jsonstr = key;
    }
    return JSON.parse(jsonstr);
};

//微校应用开启
function weixiaoopen(postdata, req, res) {
    if (postdata == null) {
        res.send({"errcode": 1, "errmsg": "参数错误", "is_config": 1});
    } else {
        var jsondata = tojson(postdata);    //处理获取的json

        //保存公众信息
        getmedia(jsondata, function (err, mediainfo) {

            if (!mediainfo.hasOwnProperty("errcode")) {

                pool.getConnection(function (err, conn) {

                    if (err) console.log(err);
                    conn.query('select * from media where media_id = ?', mediainfo.media_id, function (err, result) {

                        if (err) throw(err);
                        if (result.length < 1) {
                            pool.getConnection(function (err, addconn) {
                                addconn.query('insert into media set ?', mediainfo, function (err, isadd) {
                                    console.log(isadd);

                                    for(var i=1; i<36; i++){
                                        addconn.query('insert into media_hometown set ?', {media_id:mediainfo.media_id, homeprovinceid: i}, function (err, isaddhometown) {
                                            console.log(isaddhometown);
                                            if (err) console.log(err);
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });

        var sign = jsondata.sign;
        delete jsondata.sign;

        var calsign = calSign(jsondata);

        if (sign == calsign) {
            var interval = Date.parse(new Date()) - jsondata.timestamp * 1000;
            if (interval < 600000) {
                res.send({"errcode": 0, "errmsg": "开启成功", "is_config": 1});
            } else {
                res.send({"errcode": 1, "errmsg": "超时", "is_config": 1});
            }
        } else {
            res.send({"errcode": 1, "errmsg": "签名错误", "is_config": 1});
        }
    }


}

//微校应用关闭
function weixiaoclose(postdata, req, res) {
    var sign = postdata.sign;
    delete postdata.sign;

    var calsign = calSign(postdata)

    if (sign == calsign) {
        var interval = Date.parse(new Date()) - postdata.timestamp * 1000;
        if (interval < 600000) {
            res.send({"errcode": 0, "errmsg": "OK"});
        } else {
            res.send({"errcode": 1, "errmsg": "超时"});
        }
    } else {
        res.send({"errcode": 1, "errmsg": "签名错误"});
    }
}

//微校应用配置
function weixiaoconfig(postdata, req, res) {
    var mediaconfig = req.query;

    var sign = mediaconfig.sign;
    delete mediaconfig.sign;
    delete mediaconfig.type;


    if(sign == calSign(mediaconfig)){
        res.cookie('media_id', mediaconfig.media_id);


        res.render('mediaadmin');
    }else{
        res.send({'errcode' : 5004,'errmsg' : '签名错误'});
    }

}

//微校应用监控
function weixiaomonitor(postdata, req, res) {
    res.send(req.jquery.echostr);
}

//微校应用触发
function weixiaotrigger(postdata, req, res) {
    var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wechatconfig.appid + "&redirect_uri=http%3a%2f%2fwechat.itwang.wang%2fwechat%2flogin&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect"

    if(req.query.media_id == null || req.query.media_id == '')
        res.render("error",{message:"无法获取公众号信息", error:""});
    else{
        req.session.media_id = req.query.media_id;
        res.redirect(url);
    }
}

//获取公众号信息
function getmedia(postdata, cb) {
    var url = "http://weixiao.qq.com/common/get_media_info";
    var poststr = JSON.stringify(postdata);

    request.post({url: url, form: poststr}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var mediainfo = JSON.parse(body);
            cb(error, mediainfo);
        }
    });
}

//签名算法
function calSign(jsondata) {
    var keyarray = [];

    for (var key in jsondata) {
        keyarray.push(key);
    }
    keyarray.sort();

    var stringA = "";
    keyarray.forEach(function (key) {
        stringA += key + "=" + jsondata[key] + "&";
    });

    stringA += "key=" + wechatconfig.ApiSecret;
    var signValue = md5(stringA);

    return signValue.toUpperCase();
}

//添加用户
var addUser = function (value, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('insert into user set ?', value, function (err, result) {
            conn.release();
            if (err) throw err;
            cb(err, result);
        });
    });
};

//添加用户信息
var addUserinfo = function (value, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('insert into userinfo set ?', value, function (err, result) {
            conn.release();
            if (err) throw err;
            cb(err, result);
        });
    });
};

var userExist = function (openid, media_id, cb) {
    pool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query('select * from user_view where openid = ? and media_id = ?', [openid, media_id], function (err, result) {
            conn.release();
            if (err) throw err;
            console.log(result);
            cb(err, result);
        });
    });
};


//通过code换取网页授权access_token
var getAccessToken = function (appid, secret, code, cb) {
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code"
    request.get({url: url, form: {}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsondata = JSON.parse(body);
            cb(error, jsondata);
        }
    });
};

//通过access_token拉取用户信息
var getUserinfo = function (access_token, openid, cb) {
    request.get({
        url: "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid + "&lang=zh_CN ",
        form: {}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var userinfo = JSON.parse(body);
            cb(error, userinfo);
        }
    });
};

//JSSDL 获取access_token
function getJstoken(err, cd) {
    var tokenurl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + wechatconfig.appid + "&secret=" + wechatconfig.appsecret;
    request.get({url: url, form: {}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var tokenurl = JSON.parse(body);
            console.log(jstoken);
            var jsapiurl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + jstoken.access_token + "&type=jsapi"
            request.get({url: jsapiurl, form: {}}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var js_ticket = JSON.parse(body);

                    var sha1str = "jsapi_ticket=" + js_ticket.ticket + "&noncestr=58FCEE6C341A454DCCC4BA4D44726888&timestamp=1478225876&url=http://wechat.itwang.wang/addweibo";
                }
            });
        }
    });
}

/*
//刷新jssdk的配置,并保存到全局变量中
function refreshJSSDK() {
    var tokenurl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx43e92e841f4bfcc1&secret=c966f8621441ba80261bfaf8aad0849d";
    request.get({url: tokenurl, form: {}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jstoken = JSON.parse(body);
            console.log(jstoken);

            var jsapiurl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + jstoken.access_token + "&type=jsapi"
            request.get({url: jsapiurl, form: {}}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var js_ticket = JSON.parse(body);

                    var sha1str = "jsapi_ticket=" + js_ticket.ticket + "&noncestr=58FCEE6C341A454DCCC4BA4D44726888&timestamp=1478225876&url=http://wechat.itwang.wang/addweibo";
                    var signature = sha1(sha1str);
                    global.jssdkconfig = {
                        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: 'wx43e92e841f4bfcc1', // 必填，公众号的唯一标识
                        timestamp: 1478225876, // 必填，生成签名的时间戳
                        nonceStr: '58FCEE6C341A454DCCC4BA4D44726888', // 必填，生成签名的随机串
                        signature: signature,// 必填，签名，见附录1
                        jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage'] // 必填，需要使用的JS接口列表
                    };
                }
            });
        }
    });
}
*/
module.exports = router;