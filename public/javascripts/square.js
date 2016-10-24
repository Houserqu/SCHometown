$(document).ready(function () {
    //Tabbar 切换背景图片
    $('.weui_tabbar_item').click(function () {

        var oldsrc = $('.weui_tabbar_item img');
        for (var i = 0; i < oldsrc.length; i++) {
            oldsrc[i].src = oldsrc[i].src.replace('_on', '');
        }

        var find = $(this).find('img');
        var src = find.attr('src');
        src = src.substring(0, src.length - 4) + '_on.png';
        find.attr('src', src);
    });


    $("#tab-square").click(function () {
        showTabBody();
    });

    $("#tab-find").click(function () {
        showTabBody();
    });

    $("#tab-me").click(function () {
        showTabBody();
    });
    //显示friend页顶部导航栏
    $("#tab-friends").click(function () {
        $('#friends-tab').show();
        $('#tab-bd').hide();
        //$('#friends-good').css({'display':'block'});
    });


    var showTabBody = function () {
        $('#friends-tab').hide();
        $('#tab-bd').show();
    };

    //初始化时间选择器
    $("#datetime-picker-start").datetimePicker();
    $("#datetime-picker-end").datetimePicker();

    var checkInput = function () {

    };

    //发布活动
    $('#activitysubmit').click(function () {
        //console.log($("input[name='dataendtime']").val().replace(/-/g, "/"));
        var title = $("input[name='datatitle']").val();
        var starttime = $("input[name='datastarttime']").val();
        var endtime = $("input[name='dataendtime']").val();
        var address = $("input[name='dataaddress']").val();
        var content = $("textarea[name='datacontent']").val();
        var budget = $("input[name='databudget']").val();

        console.log(starttime);

        if (title != '' && starttime != '' && content != '') {
            $.ajax({
                type: 'post',
                url: 'editactivity/add',
                dataType: 'json',
                data: {
                    title: title,
                    starttime: starttime,
                    endtime: endtime,
                    address: address,
                    content: content,
                    budget: budget
                },
                success: function (redata) {
                    if (redata.isadd) {
                        $.toast('发布成功', function () {
                            window.location.href = '/';
                        });
                    }
                },
                error: function () {
                    console.log('error');
                }
            });
        } else {
            $.toast('请检查必填选项', 'forbidden');
        }
    });

    //获取好友
    $('#friends-good-btn').click(function () {
        if ($('#friends-good-list').attr('data-state') == 0) {
            $.ajax({
                type: 'get',
                url: '/friends/goodlist',
                data: {},
                dataType: 'json',
                success: function (redata) {
                    var html = '';
                    for (var i = 0; i < redata.goodfriends.length; i++) {
                        html += "<a class='weui_cell' href='/friends/goodfriendpage/" + redata.goodfriends[i].openid + "'><div class='weui_cell_hd'><img id='headimg' src=" + redata.goodfriends[i].headimgurl + " alt='' style='width:40px;margin-right:5px;display:block'></div> <div class='weui_cell_bd weui_cell_primary'> <p>" + redata.goodfriends[i].nickname + "</p> </div> <div class='weui_cell_ft'></div></a>";
                    }
                    $('#friends-good-list').html(html);
                    $('#friends-good-list').attr('data-state', 1);
                },
                error: function () {
                    $.toast('获取失败', 'forbidden');
                }
            });
        }
    });

    //获取乡友
    $('#friends-hometown-btn').click(function () {
        if ($('#friends-hometown-list').attr('data-state') == 0) {
            $.ajax({
                type: 'get',
                url: '/friends/homelist',
                data: {},
                dataType: 'json',
                success: function (redata) {
                    var html = '';
                    console.log(redata);
                    for (var i = 0; i < redata.homefriends.length; i++) {
                        html += "<a class='weui_cell' href='/friends/homefriendpage/" + redata.homefriends[i].openid + "'><div class='weui_cell_hd'><img id='headimg' src=" + redata.homefriends[i].headimgurl + " alt='' style='width:40px;margin-right:5px;display:block'></div> <div class='weui_cell_bd weui_cell_primary'> <p>" + redata.homefriends[i].nickname + "</p> </div> <div class='weui_cell_ft'></div></a>";
                    }
                    $('#friends-hometown-list').html(html);
                    $('#friends-hometown-list').attr('data-state', 1);
                },
                error: function () {
                    $.toast('获取失败', 'forbidden');
                }
            });
        }
    });

    //获取动态
    $('#tab-friends').click(function () {
        $.ajax({
            type: 'get',
            url: '/friends/weibolist',
            data: {},
            dataType: 'json',
            success: function (redata) {
                if(redata.state){
                    var html = '';
                    console.log(redata);
                    for (var i = 0; i < redata.weibolist.length; i++) {
                        var imghtml = "";
                        var time = "";
                        if(redata.weibolist[i].imgurl != "" && redata.weibolist[i].imgurl != null) {
                            var imgs = redata.weibolist[i].imgurl.split("||");
                            imgs.pop();
                            console.log(imgs);
                            imgs.forEach(function (img) {
                                imghtml += "<img src='/weiboimg/" + img + "'>"
                            });
                        }

                        time = reverseTime(redata.weibolist[i].origintime);

                        html += '<div class="weui_panel weui_panel_access"><div class="weui_panel_hd">'+redata.weibolist[i].nickname+'发表动态</div><div class="weui_panel_bd"> <div class="weui_media_box weui_media_text weibocontent"> <p class="weui_media_desc">'+redata.weibolist[i].content+'</p> <div class="weibocontent_imgs">'+imghtml+'<div style="clear: both"></div> </div> <ul class="weui_media_info"> <li class="weui_media_info_meta">'+time+'</li> <li class="weui_media_info_meta weui_media_info_meta_extra">评论</li> </ul> </div> </div> </div>'
                    }
                    $("#friends-weibo").append(html);

                }else{
                    $.toast("网络异常","forbidden");
                }

            },
            error: function () {
                $.toast('获取失败', 'forbidden');
            }
        });

    });

    //计算指定时间到今天0点的差值
    function reverseTime(inTime) {
        var reversetime = "";
        var timeDifference = new Date(new Date().toLocaleDateString()).getTime() - new Date(inTime).getTime();

        if(timeDifference > 0){   //如果为正  用天计算
            var weibotime = new Date(inTime).getHours();  //发布时间(小时)
            var timeDays =  timeDifference/86400000;        //距当前天数
            if(timeDays < 1){
                reversetime = "昨天 "+weibotime+"点";
            }else{
                reversetime = Math.floor(timeDays)+"天前 "+weibotime+"点";
            }
        }else{  //差值为负   用小时做单位

            //计算指定时间到现在时间的小时差值
            var timeHours =  (new Date().getTime() - new Date(inTime).getTime())/86400000*24;
            if(timeHours < 1){
                reversetime = "刚刚";
            }else{
                reversetime = Math.floor(timeHours)+"小时前";
            }
        }
        return reversetime;
    }

    //查看动态图片
    $('.weibocontent_imgs > img').on("click",function () {
        var photoitem = new Array();

        var index = $(this).index();

        var imgs = $(this).parent().children('img');
        var imgslength = imgs.length;
        for(var i=0; i<imgslength; i++){
            photoitem.push(imgs[i].src);
        }
        console.log(photoitem);

        var pb = $.photoBrowser({items:photoitem, initIndex:index});

        pb.open();
    });

    //分享弹出菜单
    $("#sharebtn").on("click",function () {
        var state = $(this).attr("data-state");
        console.log(state);
        if(state == 0){
            $("#share").popup();
            $(this).attr("data-state",1);
            $(this).find("img").attr("src",'/images/share_on.png');
        }else{
            console.log("close");
            $.closePopup();
            $(this).attr("data-state",0);
            $(this).find("img").attr("src",'/images/share.png');
        }
    });

    //首页幻灯
    var squareSwiper = new Swiper('.squareswiper',{
        speed: 400,
        autoplay: 1500,
        spaceBetween: 100

    })

});