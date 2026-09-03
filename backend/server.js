const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directories
const uploadDir = path.join(__dirname, 'uploads');
const submissionsDir = path.join(__dirname, 'submissions');
const studyMaterialsDir = path.join(__dirname, 'uploads/study_materials');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });
if (!fs.existsSync(studyMaterialsDir)) fs.mkdirSync(studyMaterialsDir, { recursive: true });

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'submissions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });
app.locals.upload = upload;

// Serve static files
app.use('/uploads', express.static(uploadDir));
app.use('/submissions', express.static(submissionsDir));

// ============ AUTH ROUTES ============
const authRoutes = require("./routes/student/authRoutes");
app.use("/api/auth", authRoutes);

// ============ STUDENT ROUTES ============
const dashboardRoutes = require("./routes/student/dashboardRoutes");
const assignmentRoutes = require("./routes/student/assignmentRoutes");
const studyMaterialRoutes = require("./routes/student/studyMaterialRoutes");
const liveSessionRoutes = require("./routes/student/liveSessionRoutes");
const courseOverviewRoutes = require("./routes/student/courseOverviewRoutes");
const crRoutes = require("./routes/student/crRoutes");

app.use("/api/student", dashboardRoutes);
app.use("/api/student", assignmentRoutes);
app.use("/api/student", studyMaterialRoutes);
app.use("/api/student", liveSessionRoutes);
app.use("/api/student", courseOverviewRoutes);
app.use("/api/student", crRoutes);

// ============ TEACHER ROUTES ============
const teacherAssignmentRoutes = require("./routes/teacher/assignmentRoutes");
const teacherLiveSessionRoutes = require("./routes/teacher/liveSessionRoutes");
const teacherAnnouncementRoutes = require("./routes/teacher/announcementRoutes");
const teacherStudyMaterialRoutes = require("./routes/teacher/studyMaterialRoutes");

app.use("/api/teacher", teacherAssignmentRoutes);
app.use("/api/teacher", teacherLiveSessionRoutes);
app.use("/api/teacher/announcements", teacherAnnouncementRoutes);
app.use("/api/teacher/materials", teacherStudyMaterialRoutes);

// ============ STUDENT ANNOUNCEMENT ROUTES ============
const studentAnnouncementRoutes = require("./routes/student/announcementRoutes");
app.use("/api/student/announcements", studentAnnouncementRoutes);

// ============ TEST ENDPOINT ============
app.get("/test", (req, res) => {
  res.json({ message: "Backend working" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Teacher Materials API: http://localhost:5000/api/teacher/materials/TCH001`);
});