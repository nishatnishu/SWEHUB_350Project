const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { 
  getAssignments, 
  getAssignmentById, 
  submitAssignment 
} = require("../../controllers/student/assignmentController");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'submissions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get("/assignments", getAssignments);
router.get("/assignments/:id", getAssignmentById);
router.post("/assignments/:id/submit", upload.single('file'), submitAssignment);

module.exports = router;