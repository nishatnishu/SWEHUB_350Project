const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getTeacherMaterials,
  getTeacherCourses,
  uploadMaterial,
  deleteMaterial,
  getStatistics
} = require("../../controllers/teacher/studyMaterialController");

// Configure multer for study materials upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/study_materials/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.zip', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

router.get("/:teacherId", getTeacherMaterials);
router.get("/courses/:teacherId", getTeacherCourses);
router.get("/stats/:teacherId", getStatistics);
router.post("/upload/:teacherId", upload.single('file'), uploadMaterial);
router.delete("/delete/:materialId", deleteMaterial);

module.exports = router;