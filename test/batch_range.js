var cow = require('../');
var test = require('tape');
var levelup = require('levelup');
var memdb = require('memdb');
var sub = require('subleveldown');

test('batch range', function (t) {
    t.plan(4);
    var db = memdb();
    var db0 = sub(db, '0', { valueEncoding: 'json' });
    db0.batch([
        { type: 'put', key: 'a', value: 100 },
        { type: 'put', key: 'b', value: 555 },
        { type: 'put', key: 'c', value: 300 },
    ], onbatch);

    function onbatch (err) {
        t.ifError(err);
        var db1 = levelup('', {
            db: function () { return cow(db0, sub(db, '1')) },
            valueEncoding: 'json'
        });
        db1.batch([
            { type: 'put', key: 'b', value: 5000 },
            { type: 'del', key: 'c' },
            { type: 'put', key: 'd', value: 1234 }
        ], function (err) {
            t.ifError(err);
            check0(db0);
            check1(db1);
        });
    }
    function check0 (db) {
        var r = db.createReadStream();
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'a', value: 100 },
                { key: 'b', value: 555 },
                { key: 'c', value: 300 }
            ]);
        });
    }
    function check1 (db) {
        var r = db.createReadStream();
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'a', value: 100 },
                { key: 'b', value: 5000 },
                { key: 'd', value: 1234 }
            ]);
        });
    }
});
