const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
        
        Promise
            .resolve(requestHandler(req, res, next))
            .catch( (err) => next(err))
        
    }
}






export {asyncHandler};

{/* This code snippet is primarily designed to handle asynchronous operations in Express.js middleware functions */}