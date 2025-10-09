import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { registerUser } from "../controllers/user.controller.js";

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