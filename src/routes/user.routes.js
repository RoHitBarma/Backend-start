import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { loggedOutUser, loginUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
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