import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError";
import { match } from "assert";



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SEcRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            console.log("Please upload local file path.")
        }
        //Upload the file on cloudnery
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded successfully on cloudinary.", response.url)
        fs.unlinkSync(localFilePath)
        console.log("Response: ", response)
        return response;
    } catch (error) {
        fs.unlink(localFilePath) // remove the locally saved temporary file as the upload opreation got failed.
        return null
    }
}

const deleteFromCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            throw new ApiError(400, "Local File is missing")
        }
        const response = await cloudinary.uploader.destroy(localFilePath, {
            resource_type: "auto"
        })

        console.log("File deleted successfully from cloudinary.", response.url)
        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new ApiError(500, "Failed to delete file from Cloudinary");
    }
}

const extractPublicIdFromUrl = (url) => {
    try{
        const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/)
        return matches ? matches[1] : null;
    }catch (error){
        console.error("Error extracting public ID:", error)
        return null
    }
}


export {uploadOnCloudinary, deleteFromCloudinary, extractPublicIdFromUrl}


/** 
(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SERECT // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();
*/