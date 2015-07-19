module.exports = function prefix (pre, key) {
    if (typeof key === 'string') return pre + key;
    if (Buffer.isBuffer(key)) {
        return Buffer.concat([ new Buffer(pre), key ]);
    }
    throw new Error('unhandled key type');
};
