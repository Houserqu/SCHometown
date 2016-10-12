var sql = require('../CURDmysql');

var square = function () {};


square.getUserinfo = function (cb) {
    sql.find({colums:'*',table:'user'},function (err,results) {
        cb(err,results);
    });
};

square.addActivity = function (values,cb) {
    var activity = new Array();
    activity['table'] = 'activity';
    activity['values'] = values;
    sql.insert(['activity',],function (err,results) {
        cb(err,results);
    });
};
module.exports = square;