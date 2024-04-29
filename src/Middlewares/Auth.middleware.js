// this file only varifies that we have User or not...

import { ApiError } from "../Utils/ApiError";
import { asyncHandler } from "../Utils/asyncHandler";

export const varifyJWT = asyncHandler( async (req, res, next) => {
    const Token = req.cookies?.accessToken || req.header("Authrization")?.replace('Bearer ', "");
     
    // checking
    if(!Token){
        throw new ApiError(401, "Unauthorized request !!")
    }
})