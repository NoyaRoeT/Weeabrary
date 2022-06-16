module.exports = fn => {
    return (err, req, res, next) => {
        return fn(err, req, res, next).catch(e => next(e));
    }
}