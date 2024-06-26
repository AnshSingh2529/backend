import { asyncHandler } from "../Utils/asyncHandler.js";
import {ApiError} from "../Utils/ApiError.js"
import { User} from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
      
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};


    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

    const registerUser = asyncHandler( async (req, res) => {
        // get user details from frontend
        // validation - not empty
        // check if user already exists: username, email
        // check for images, check for avatar
        // upload them to cloudinary, avatar
        // create user object - create entry in db
        // remove password and refresh token field from response
        // check for user creation
        // return res


        const {fullname, email, username, password } = req.body
        //console.log("email: ", email);

        if (
            [fullname, email, username, password].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists")
        }
        //console.log(req.files);

        const avatarLocalPath = req.files?.avatar[0]?.path;
        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar path is required !!")
        }

        let avatar, coverImage;
        try {
            avatar = await uploadOnCloudinary(avatarLocalPath)
            if(!avatar){
                throw new ApiError(400, "Avatar is required")
            }
        } catch (error) {
            throw new ApiError(500, "Avatar upload failed !!")
        }

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        try {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        } catch (error) {
            throw new ApiError(500, "coverImage upload failed !!")
        }


    

        const newUser = {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
        }

        const user = await User.create(newUser);

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )

    } )

    const loginUser = asyncHandler(async (req, res) =>{
        // req body -> data
        // username or email
        //find the user
        //password check
        //access and referesh token
        //send cookie
    
        const {email, username, password} = req.body
       
    
        if (!username && !email) {
            throw new ApiError(400, "username or email is required")
        }
        
        // Here is an alternative of above code based on logic discussed in video:
        // if (!(username || email)) {
        //     throw new ApiError(400, "username or email is required")
            
        // }
    
        const userdata = await User.findOne({
            $or: [{username}, {email}]
        })
        console.log(userdata)
    
        if (!userdata) {
            throw new ApiError(404, "User does not exist")
        }
    
       const isPasswordValid = await userdata.isPasswordCorrect(password)
    
       if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
    
       const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(userdata._id)
        
        const loggedInUser = await User.findById(userdata._id).select("-password -refreshToken")
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    userdata: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
    
    })
    
    const logoutUser = asyncHandler( async (req, res) => {
        // Remove cookies
      await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {            //Only modified from the `server` !!
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, "User logged out !!"))


    })

    const refreshAccessToken = asyncHandler( async(req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized request !! ")
        }

       try {
         const decodedToken = jwt.verify(
             incomingRefreshToken, 
             process.env.REFRESH_TOKEN_SECRET
         )
         
         const user = await User.findById(decodedToken?._id)
 
         if(!user){
             throw new ApiError(401, "Invalid Refresh Token")
         }
 
         if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(401, "Refresh Token is expired or used !!")
         }
 
         const options = {
             httpOnly: true, 
             secure: true
         }
         
         const {accessToken, NewRefreshToken} = await generateAccessAndRefereshTokens(user._id)
 
         return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken",NewRefreshToken,options)
         .json(
             new ApiResponse(
                 200,
                 {accessToken, NewRefreshToken}, 
                 "Access Token Refreshed Successfully!"
             )
         )
       } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
       }
    })

    const changeCurrentPassword = asyncHandler( async (req, res) => {
        const {oldPassword, newPassword} = req.body

        const user = await User.findById(req.user?._id);

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError(401, "Incorrect Password !!")
        }

        user.password = newPassword;

        await user.save({validateBeforeSave: false})

        return res.status(200)
        .json(new ApiResponse(200, "Password changed successfully ~"))
    })

    const getCurrentUser = asyncHandler( async (req, res) => {
        return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User fetched SuccessFully ~"))
    })

    const updateAccountDetail = asyncHandler( async (req, res) => {
        const {fullname, email, } = req.body

        if(!fullname || !email){
            throw new ApiError(400, "All fields are required ")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullname,
                    email
                }
            },
            {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200, user, "Accound Detail updated Successfully ~"))
    })

    const updateUserAvatar = asyncHandler( async (req, res) => {
        const avatarLocalPath = req.file?.path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar file is missing !!")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if(!avatar.url){
            throw new ApiError(400, "Avatar url is missing !!")
        }

        const user = await User.findByIdAndUpdate( 
            req.user._id ,
            {
                $set: {
                    avatar : avatar.url,
                    
                }
            },
            {new: true}).select("-password")

            return res
            .status(200)
            .json(new ApiResponse(200, user, "Avatar Image updated Successfully !"));

    })

    const updateUserCoverImage = asyncHandler( async(req, res) => {
        const coverImageLocalPath = req.file?.path;

        if(!coverImageLocalPath){
            throw new ApiError(400, "CoverImage path not found")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        
        if(!coverImage){
            throw new ApiError(400, "coverImage Not is Missing");
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            {new: true}

        )

        return res
            .status(200)
            .json(new ApiResponse(200, user, "CoverImage updated Successfully !"));

    })



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,   
};