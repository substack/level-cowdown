module.exports = function notFound (err) {
    return err && (err.type === 'NotFoundError' || err.message === 'NotFound');
};
