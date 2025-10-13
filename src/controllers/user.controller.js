import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import { emit, send } from "process";


const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }
} 

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
    // console.log("username: ", username);
    // console.log("fullname: ", fullname);
    // console.log("email: ", email);
    // console.log("password: ", password);

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

const loginUser = asyncHandler( async(req, res) => {
    // take response details from user
    // validate all form is filled
    // check user signIn or not
    // check password
    // access token and refresh token
    // send cookie
    
    const {username, email, password} = req.body

    if (!username && !email){
        throw new ApiError(400, "Username or Email required for login.")
    }
    // if (!(username || email)){
    //     throw new ApiError(400, "Username or Email required for login.")
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User doesn't exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Wrong Password!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedIn successfully."
        )
    )
})

const loggedOutUser = asyncHandler(async () => {
    User.findByIdAndUpdate(
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

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User LogggedOut successfully."))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unautharized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user){
            throw new ApiError(401, "Your refresh token is expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accesstoken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassowrd = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, "Password changed successfully."))
     
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fatched successfully")
})

const updateUserDetails = asyncHandler( async(req, res) => {
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(400, "All fields are required.")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, "Account details updated successfully."))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while avatar uploading on cloudnery")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}      
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Avatar is updated successfully.")
    )
})

const updateUserCoverImgge = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while avatar uploading on cloudnery")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true} 
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200,user, "Cover Image is updated successfully.")
    )
})

export {
    registerUser, 
    loginUser, 
    loggedOutUser, 
    refreshAccessToken, 
    changeCurrentPassowrd, 
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImgge
}