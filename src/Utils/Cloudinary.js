import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({ 

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET 

  });

  const UploadOnCloudinary = async (localFilePath) => {
    console.log(localFilePath);     //testing...
    
    try {
        if(!localFilePath){
            return null
        }
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        //file has been uploaded successfully

        console.log("File is uploaded on coudinary", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);  //Remove the locally saved temporary file as the upload operation got failed !!

        return null;
    }
  }

  export {UploadOnCloudinary};