import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req, res) => {
    // take data from user
    // velidation not empty
    // check user should unique: check email + username
    // check for images, check for avatars
    // upload them to cloudenary, avatar
    // remove password and refresh token field from response
    // create user
    // send response

    const {username, email, fullname, password} = req.body
    console.log("email: ", email);

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "") 
    ){
        throw new apiError(400, "All fields are required.")
    }

    // checking existed user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new apiError(409, "User already existed")
    }

    const avatarLocalPath = req.path?.avatar[0]?.path;
    const coverImageLocalPath = req.path?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(414, "Avatar File is required")
    }

    const avatarFile = await uploadOnCloudinary(avatarLocalPath)
    const coverImageFile = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatarFile){
        throw new apiError(400, "Avatar image is missing.")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        avatarFile: avatarFile.url,
        coverImageFile: coverImageFile?.url || "",
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while regestring the user.")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User Created Successfully.")
    )

})

export {registerUser}