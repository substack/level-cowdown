var inherits = require('inherits');
var AbstractIterator = require('abstract-leveldown');

module.exports = CowIterator;
function CowIterator (cow, opts) {
    this._o = cow._odb.iterator(opts);
    this._n = cow._ndb.iterator(opts);
}

CowIterator.prototype._next = function (cb) {
    
};

CowIterator.prototype._end = function (cb) {
};
