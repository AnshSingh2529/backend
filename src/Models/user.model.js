import mongoose, { Schema } from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Initialising a middleware
UserSchema.pre("save", async function(next) {
  if(!this.isModified("password")){
    return next();
  }
  this.password = bcrypt.hash(this.password, 10);
  next()
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

//Access token jwt 

UserSchema.methods.generateAccessToken =  function(){
  return jwt.sign(
    {
      _id : this._id,
      email : this.email,
      username : this.username,
      fullname : this.fullname,

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY
    }
  )
}

//Refresh token jwt 
UserSchema.methods.generateRefreshToken =  function(){
  return jwt.sign(
    {
      _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY
    }
  )
}
UserSchema.methods.generateRefreshToken =  function(){
  
}

export const User = mongoose.model("User", UserSchema);