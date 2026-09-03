const express = require("express");
const router = express.Router();

const {
  getTeacherAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getCommentsForTeacher  // Add this
} = require("../../controllers/teacher/announcementController");

router.get("/:teacherId", getTeacherAnnouncements);
router.get("/comments/:announcementId", getCommentsForTeacher);  // Add this line
router.post("/create/:teacherId", createAnnouncement);
router.delete("/delete/:announcementId", deleteAnnouncement);

module.exports = router;