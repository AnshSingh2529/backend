const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        
        Promise.resolve(requestHandler(req, res, next))
        .catch( (err) => next(err))
        
    }
}






export default asyncHandler;


/*Try and Catch method */

// const asyncHandler = (funct) =>  async(req, res, next) => {
//     try {
//         await funct(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message:error.message
//         })
//     }
// }