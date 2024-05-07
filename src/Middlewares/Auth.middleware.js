// this file only varifies that User exist or not...

import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User}from "../Models/user.model.js";


export const varifyJWT = asyncHandler( async (req, _, next) => {       //when there is no use of that 'res' we can replace it by '_'.
    try {
        const Token = req.cookies?.accessToken || req.header("Authrization")?.replace('Bearer ', "");
         
        // checking
        if(!Token){
            throw new ApiError(401, "Unauthorized request !!")
        }
    
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")

    
        if(!user){
            throw new ApiError(401, "Invalid Access Token !!")
        }
    
        req.user = user;
        next()                         //passes control to the next middleware function.
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token !!")
    }
})