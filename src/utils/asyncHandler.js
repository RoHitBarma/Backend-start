const asyncHandler = (requesthandler) => {
    return (req, res, next) => {
        Promise.resolve(requesthandler(req, res, next))
        .catch((err) => next(err))
    }
}


export {asyncHandler}


/*  // this is try catch method but many time we use promises to handle it
// we user higher order function ok
const asyncHandler = (fn) => async(req, res, next) => {
    try{
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            sucess: false,
            message: err.message
        })
    }
}

export {asyncHandler}
*/