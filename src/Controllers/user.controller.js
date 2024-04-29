import { asyncHandler } from "../Utils/asyncHandler.js";
import {ApiError} from "../Utils/ApiError.js"
import { User} from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import { ApiResponse } from "../Utils/ApiResponse.js";

const generateAccessAndRefreshTokens =async (userId) => {
    try {

        const userData = await User.findById(userId);
        const accessToken = userData.generateAccessToken();
        const refreshToken = userData.generateRefreshToken();

        userData.refreshToken = refreshToken;
        await userData.save({ValidateBeforeSave : false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong !!");
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

    const loginUser = asyncHandler( async (req, res) => {
        {/*
            >take data from req.body
            >check if User is registered..if(yes) => access otherwise,No access.
            >User's "email" or "username" && User's "password" to login..
            >check email or username && password is correct.
            > access token && refresh token..
            >send cookie that user had logged in..
            
        */}
                // step 1
        const {email, username, password} = req.body;
        // checking
        if(!username || !email ){
            throw new ApiError(400, "username or email is required !!");
        }
                // step 2
        const registeredUser = await User.findOne({ $or:[{username}, {email}]});
        // checking
        if(!registeredUser){
            throw new ApiError(404, "you are not Registered !!");
        }

                // step 3
        const isValidPassword = await registeredUser.isPasswordCorrect(password);
        // checking
        if(!isValidPassword){
            throw new ApiError(401, "Invalid user credentials !!")
        }

                // step 4
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(userData._id);
    
    const LoggedInUser = await User.findById(registeredUser._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly:true,
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
                registerUser: LoggedInUser, accessToken, refreshToken
            },
            "User Loggedin Successfully"
        )
    )
    


    })

    const logoutUser = asyncHandler( async (req, res) => {
        // Remove cookies
        //  
    })

export {registerUser,loginUser,logoutUser};