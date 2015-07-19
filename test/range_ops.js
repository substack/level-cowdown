var cow = require('../');
var test = require('tape');
var levelup = require('levelup');
var memdb = require('memdb');
var sub = require('subleveldown');

test('range ops', function (t) {
    t.plan(9);
    var db = memdb();
    var db0 = sub(db, '0', { valueEncoding: 'json' });
    db0.batch([
        { type: 'put', key: 'aardvark', value: 1 },
        { type: 'put', key: 'badger', value: 2 },
        { type: 'put', key: 'cow', value: 3 },
        { type: 'put', key: 'duck', value: 4 },
        { type: 'put', key: 'frog', value: 5 },
        { type: 'put', key: 'goose', value: 6 },
        { type: 'put', key: 'horse', value: 7 }
    ], onbatch);
    
    function onbatch (err) {
        t.ifError(err);
        var db1 = levelup('', {
            db: function () { return cow(db0, sub(db, '1')) },
            valueEncoding: 'json'
        });
        db1.batch([
            { type: 'put', key: 'cat', value: 2.5 },
            { type: 'del', key: 'goose' },
            { type: 'put', key: 'dog', value: 3.5 },
            { type: 'put', key: 'grouse', value: 6.5 },
        ], function (err) {
            t.ifError(err);
            check0(db0);
            check1a(db1);
            check1b(db1);
            check1c(db1);
            check1d(db1);
            check1e(db1);
            check1f(db1);
        });
    }
    function check0 (db) {
        var r = db.createReadStream({ gt: 'cow' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'duck', value: 4 },
                { key: 'frog', value: 5 },
                { key: 'goose', value: 6 },
                { key: 'horse', value: 7 }
            ]);
        });
    }
    function check1a (db) {
        var r = db.createReadStream({ gt: 'cow' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'dog', value: 3.5 },
                { key: 'duck', value: 4 },
                { key: 'frog', value: 5 },
                { key: 'grouse', value: 6.5 },
                { key: 'horse', value: 7 }
            ]);
        });
    }
    function check1b (db) {
        var r = db.createReadStream({ gte: 'cow' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'cow', value: 3 },
                { key: 'dog', value: 3.5 },
                { key: 'duck', value: 4 },
                { key: 'frog', value: 5 },
                { key: 'grouse', value: 6.5 },
                { key: 'horse', value: 7 }
            ]);
        });
    }
    function check1c (db) {
        var r = db.createReadStream({ gte: 'cow', lt: 'frog' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'cow', value: 3 },
                { key: 'dog', value: 3.5 },
                { key: 'duck', value: 4 }
            ]);
        });
    }
    function check1d (db) {
        var r = db.createReadStream({ gte: 'cow', lte: 'frog' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'cow', value: 3 },
                { key: 'dog', value: 3.5 },
                { key: 'duck', value: 4 },
                { key: 'frog', value: 5 }
            ]);
        });
    }
    function check1e (db) {
        var r = db.createReadStream({ lte: 'duck' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'aardvark', value: 1 },
                { key: 'badger', value: 2 },
                { key: 'cat', value: 2.5 },
                { key: 'cow', value: 3 },
                { key: 'dog', value: 3.5 },
                { key: 'duck', value: 4 }
            ]);
        });
    }
    function check1f (db) {
        var r = db.createReadStream({ lt: 'duck' });
        var rows = [];
        r.on('data', function (row) { rows.push(row) });
        r.on('end', function () {
            t.deepEqual(rows, [
                { key: 'aardvark', value: 1 },
                { key: 'badger', value: 2 },
                { key: 'cat', value: 2.5 },
                { key: 'cow', value: 3 },
                { key: 'dog', value: 3.5 }
            ]);
        });
    }
});
