var pool = require("./config/mysql")

//var province = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35] ;
pool.getConnection(function (err, conn) {

            conn.query("select * from activity_view union select * from weibo_view ", function (err,result) {
                if(err) console.log(err);
                console.log(result);
            });
});
