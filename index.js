var inherits = require('inherits');
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN;
var sub = require('subleveldown');

var CowIterator = require('./lib/iterator.js');

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
        { type: 'put', key: dkey, value: '', valueEncoding: 'utf8' },
        { type: 'del', key: nkey },
    ], opts, cb)
};

Cow.prototype._iterator = function (opts) {
    return new CowIterator(this, opts);
};

function prefix (pre, key) {
    if (typeof key === 'string') return pre + key;
    if (Buffer.isBuffer(key)) {
        return Buffer.concat([ new Buffer(pre), key ]);
    }
    throw new Error('unhandled key type');
}

function notFound (err) {
    return err && (err.type === 'NotFoundError' || err.message === 'NotFound');
}
