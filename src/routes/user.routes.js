import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { 
  loggedOutUser, 
  loginUser, 
  registerUser, 
  refreshAccessToken, 
  changeCurrentPassowrd, 
  getCurrentUser, 
  updateUserAvatar, 
  updateUserDetails, 
  updateUserCoverImgge, 
  getWatchHistory, 
  getUserChannelProfile 
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(
  loginUser
)


router.route("/logout").post(verifyJWT, loggedOutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassowrd)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/update-user").patch(verifyJWT, updateUserDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImgge)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)

router.post(
  "/test-upload",
  upload.single("avatar"),
  (req, res) => {
    console.log("📥 File received:", req.file);
    res.json({
      message: "File received successfully",
      file: req.file,
    });
  }
);

export default router