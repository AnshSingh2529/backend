import asyncHandler from "../Utils/asyncHandler.js";
import ApiError from '../Utils/ApiError.js';
import {User} from '../Models/user.model.js';
import UploadOnCloudinary from '../Utils/Cloudinary.js';
import ApiResponse from '../Utils/ApiResponse.js';


const registerUser = asyncHandler( async (req, res) => {
        // get user detail from frontend
        // validation (should not empty)
        // check if user already exist (check with username and email)
        // Files, check for images || check for avatar
        // uplaod them to cloudinary (ek return URL milta hai use lena hai)
        // create user object || create entry in db || sari information user ka...
        // remove password and refresh token field from response || user ko encrypted data nhi dena hai ...
        // check response || user creation successfully ?? if not then [Error]
        // return res

        // 1st step
        const {fullname, email, password, username} = req.body;
        console.log("Email : ", email);
        
        // checking...
        if([fullname, email, password, username]
            .some( (fields) => (
                fields?.trim() === ""
            ))
        ){
            throw new ApiError(400, "All field are required !!")
        }

        // 2nd step
       const existedUser = User.findOne(
            {
                $or: [{ email },{ username }]
            })

        // checking...
        if(existedUser){
            throw new ApiError(409, "User already existed !!" )
        }

        // 3rd step
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        // checking...
        if (!avatarLocalPath) {
            throw new ApiError(400, "avatar file is required !!");
        }

        // 4th step
        const avatar = await UploadOnCloudinary(avatarLocalPath);
        const coverImage = await UploadOnCloudinary(coverImageLocalPath);

        // checking...
        if(!avatar){
            throw new ApiError(400, "avatar file is required !!");
        }

        // 5th step
       const user = await User.create(
            {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            username: username.toLowerCase(),
            password   

            })

        //checking...
        
        const UserCreated = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!UserCreated){
            throw new ApiError(500, "Something went wrong while registering User !!")
        }

        // 6th step
        return res.status(201).json(
            new ApiResponse(200, UserCreated, "User registered Successfully ~" )
        )


        
})

export default registerUser;