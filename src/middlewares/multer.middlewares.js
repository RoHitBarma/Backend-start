import multer from "multer"; 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📁 Multer destination called");
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    console.log("📝 Multer processing file:", file.originalname);
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
  storage, 
})