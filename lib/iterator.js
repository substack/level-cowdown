var inherits = require('inherits');
var AbstractIterator = require('abstract-leveldown').AbstractIterator;
var copy = require('shallow-copy');
var once = require('once');
var prefix = require('./prefix.js');
var notFound = require('./not_found.js');

module.exports = CowIterator;
inherits(CowIterator, AbstractIterator);

function CowIterator (cow, opts) {
    AbstractIterator.call(this);
    this._ndb = cow._ndb;
    this._odb = cow._odb;
    this._o = cow._odb.iterator(opts);
    this._n = cow._ndb.iterator(fix(copy(opts)));
    this._ocur = undefined;
    this._ncur = undefined;
}

CowIterator.prototype._next = function (cb) {
    var self = this;
    var o = this._o, n = this._n;
    var pending = 1;
    cb = once(cb);
    
    if (self._ocur === undefined) {
        pending ++;
        o.next(function onnext (err, key, value) {
            if (err) return cb(err)
            if (key === undefined) {
                self._ocur = undefined;
                return done();
            }
            self._ndb.get(prefix('d', key), function (err) {
                if (notFound(err)) {
                    checkn(); // not deleted, check existence
                }
                else if (err) cb(err)
                else o.next(onnext); // deleted, try another
            });
            function checkn () {
                self._ndb.get(prefix('n', key), function (err) {
                    if (notFound(err)) {
                        self._ocur = { key: key, value: value };
                        done();
                    }
                    else o.next(onnext); // drop overwritten key
                });
            }
        });
    }
    if (self._ncur === undefined) {
        pending ++;
        n.next(function (err, key, value) {
            if (err) return cb(err)
            if (key === undefined) {
                self._ncur = undefined;
                return done();
            }
            self._ncur = { key: strip(key), value: value };
            done();
        });
    }
    done();
    
    function done () {
        if (-- pending !== 0) return;
        var k, v;
        function picko () {
            k = self._ocur.key;
            v = self._ocur.value;
            self._ocur = undefined;
        }
        function pickn () {
            k = self._ncur.key;
            v = self._ncur.value;
            self._ncur = undefined;
        }
        
        if (self._ocur === undefined && self._ncur === undefined) {
            k = undefined;
            v = undefined;
        }
        else if (self._ncur === undefined) picko()
        else if (self._ocur === undefined) pickn()
        else if (self._ocur.key < self._ncur.key) picko()
        else pickn()
        cb(null, k, v);
    }
};

CowIterator.prototype._end = function (cb) {
};

function fix (opts) {
    if (opts.gt) opts.gt = prefix('n', opts.gt);
    if (opts.gte) opts.gte = prefix('n', opts.gte);
    if (opts.lt) opts.lt = prefix('n', opts.lt);
    if (opts.lte) opts.lte = prefix('n', opts.lte);
    if (!opts.gt && !opts.gte) opts.gt = 'n';
    if (!opts.lt && !opts.lte) opts.lt = 'p';
    return opts;
}

function strip (key) {
    if (typeof key === 'string') return key.slice(1);
    if (Buffer.isBuffer(key)) return key.slice(1);
    throw new Error('unhandled key type');
}
