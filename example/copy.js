var cow = require('../');
var levelup = require('levelup');
var memdb = require('memdb');

var src = memdb({ valueEncoding: 'json' });
src.batch([
    { type: 'put', key: 'a', value: 100 },
    { type: 'put', key: 'b', value: 555 },
    { type: 'put', key: 'c', value: 300 },
], ready);

function ready () {
    var copy = levelup('fake', {
        db: function () { return cow(src, memdb()) },
        valueEncoding: 'json'
    });
    copy.get('a', function (err, value) {
        console.log('a=', value);
    });
    copy.put('b', 5000, function (err) {
        src.get('b', function (err, value) {
            console.log('b:src=', value);
        });
        copy.get('b', function (err, value) {
            console.log('b:copy=', value);
        });
    });
}
