import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req, res) => {

    console.log("📁 Request files:", req.files);
    console.log("📁 Files keys:", Object.keys(req.files || {}));
    // take data from user
    // velidation not empty
    // check user should unique: check email + username
    // check for images, check for avatars
    // upload them to cloudenary, avatar
    // remove password and refresh token field from response
    // create user
    // send response

    const {username, email, fullname, password} = req.body
    console.log("username: ", username);
    console.log("fullname: ", fullname);
    console.log("email: ", email);
    console.log("password: ", password);

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "") 
    ){
        throw new ApiError(400, "All fields are required.")
    }

    // checking existed user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User already existed")
    }

    console.log("req.files received from multer:", req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImageLocalPath) && req.files.coverImageLocalPath > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    // console.log("🖼️ Avatar path:", avatarLocalPath);
    // console.log("🖼️ CoverImage path:", coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(414, "Avatar File is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar image is missing.")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while regestring the user.")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User Created Successfully.")
    )

})

export {registerUser}