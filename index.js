var inherits = require('inherits');
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN;
var sub = require('subleveldown');
var xtend = require('xtend');

var CowIterator = require('./lib/iterator.js');
var prefix = require('./lib/prefix.js');
var notFound = require('./lib/not_found.js');

module.exports = Cow;
inherits(Cow, AbstractLevelDOWN);

function Cow (odb, ndb) {
    if (!(this instanceof Cow)) return new Cow(odb, ndb);
    AbstractLevelDOWN.call(this, 'fake');
    this._odb = odb.db || odb;
    this._ndb = ndb.db || ndb;
}

Cow.prototype._open = function (opts, cb) {
    var self = this;
    process.nextTick(function () { cb(null, self) });
};
 
Cow.prototype._put = function (key, value, opts, cb) {
    var dkey = prefix('d', key);
    var nkey = prefix('n', key);
    this._ndb.batch([
        { type: 'del', key: dkey },
        { type: 'put', key: nkey, value: value },
    ], opts, cb)
};

Cow.prototype._get = function (key, opts, cb) {
    var self = this;
    self._ndb.get(prefix('d', key), opts, function (err, value) {
        if (err && notFound(err)) checkn()
        else if (err) cb(err)
        else cb(new Error('NotFound'));
    });
    function checkn () {
        self._ndb.get(prefix('n', key), opts, function (err, value) {
            if (err && notFound(err)) {
                checko();
            }
            else cb(err, value)
        });
    }
    function checko () {
        self._odb.get(key, opts, cb);
    }
};
 
Cow.prototype._del = function (key, opts, cb) {
    var dkey = prefix('d', key);
    var nkey = prefix('n', key);
    this._ndb.batch([
        { type: 'put', key: dkey, value: '0', valueEncoding: 'utf8' },
        { type: 'del', key: nkey },
    ], opts, cb)
};

Cow.prototype._iterator = function (opts) {
    return new CowIterator(this, opts);
};

Cow.prototype._batch = function (rows, opts, cb) {
    var ops = [];
    rows.forEach(function (row) {
        var dkey = prefix('d', row.key);
        var nkey = prefix('n', row.key);
        if (row.type === 'put') {
            ops.push(
                { type: 'del', key: dkey },
                xtend(row, { key: nkey })
            );
        }
        else if (row.type === 'del') {
            ops.push(
                { type: 'put', key: dkey, value: '0', valueEncoding: 'utf8' },
                xtend(row, { key: nkey })
            );
        }
    });
    this._ndb.batch(ops, opts, cb);
};
