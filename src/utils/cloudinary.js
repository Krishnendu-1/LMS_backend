import {v2 as cloudinary} from "cloudinary"
import { configDotenv } from "dotenv"

configDotenv();

cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret:process.env.CLOUDNARY_API_SECRET 
});

export const uploadMediaToCloudinary=async(file)=>{
    try{
        if(!file) return null;
    const uploadResult= await cloudinary.uploader.upload(file, {resource_type:"auto" });
       console.log("media file uploaded",uploadResult.url);
       return uploadResult;
    } catch(error){
       console.log(error);
       return null;
   };
}


export const deleteVideoToCloudinary=async(publicID)=>{
    try{
        if(!publicID) return null;
    const deletedResult= await cloudinary.uploader.destroy(publicID, {resource_type:"video" });
       console.log("video file deleted");
       return deletedResult;
    } catch(error){
       console.log("error in deleting video");
       return null;
   };
}


export const deleteMediaToCloudinary=async(publicID)=>{
    try{
        if(!publicID) return null;
    const deletedResult= await cloudinary.uploader.destroy(publicID,);
       console.log("image file deleted");
       return deletedResult;
    } catch(error){
       console.log("error in deleting video");
       return null;
   };
}


