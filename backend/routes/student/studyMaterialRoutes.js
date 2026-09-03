const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { 
  getStudyMaterials,
  getMaterialsByCourse,
  getMyUploads,
  getSavedMaterials,
  uploadMaterial,
  toggleSaveMaterial,
  incrementDownloadCount,
  getStatistics
} = require("../../controllers/student/studyMaterialController");

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
    const allowedTypes = ['.pdf', '.docx', '.pptx', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Routes
router.get("/study-materials", getStudyMaterials);
router.get("/study-materials/course/:courseCode", getMaterialsByCourse);
router.get("/study-materials/my-uploads", getMyUploads);
router.get("/study-materials/saved", getSavedMaterials);
router.get("/study-materials/stats", getStatistics);
router.post("/study-materials/upload", upload.single('file'), uploadMaterial);
router.post("/study-materials/:materialId/save", toggleSaveMaterial);
router.post("/study-materials/:materialId/download", incrementDownloadCount);

module.exports = router;