var cow = require('../');
var test = require('tape');
var levelup = require('levelup');
var memdb = require('memdb');
var sub = require('subleveldown');

test('copy', function (t) {
    t.plan(3);
    var db = memdb();
    var db0 = sub(db, '0', { valueEncoding: 'json' });
    db0.batch([
        { type: 'put', key: 'a', value: 100 },
        { type: 'put', key: 'b', value: 555 },
        { type: 'put', key: 'c', value: 300 },
    ], ready);

    function ready () {
        var db1 = levelup('', {
            db: function () { return cow(db0, sub(db, '1')) },
            valueEncoding: 'json'
        });
        db1.get('a', function (err, value) {
            t.equal(value, 100, 'a:db1=100');
        });
        db1.put('b', 5000, function (err) {
            db0.get('b', function (err, value) {
                t.equal(value, 555, 'b:db0=555');
            });
            db1.get('b', function (err, value) {
                t.equal(value, 5000, 'b:db1=5000');
            });
        });
    }
});
