var cow = require('../');
var memdb = require('memdb');
var db = memdb({ valueEncoding: 'json' });
var sub = require('subleveldown');

var db0 = sub(db, '0');
db0.batch([
    { type: 'put', key: 'a', value: 100 },
    { type: 'put', key: 'b', value: 555 },
    { type: 'put', key: 'c', value: 300 },
], ready);

function ready () {
    var db1 = cow(db, sub(db, '1'));
    db1.get('a', function (err, value) {
        console.log('a=', value);
    });
    db1.put('b', 5000, function (err) {
        db0.get('b', function (err, value) {
            console.log('b:db0=', value);
        });
        db1.get('b', function (err, value) {
            console.log('b:db1=', value);
        });
    });
}
