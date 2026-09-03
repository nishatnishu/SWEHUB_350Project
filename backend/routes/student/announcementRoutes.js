const express = require("express");
const router = express.Router();

const {
  getStudentAnnouncements,
  getComments,
  addComment,
  toggleLike,
  getUserBatch
} = require("../../controllers/teacher/announcementController");

router.get("/user-batch/:studentId", getUserBatch);
router.get("/comments/:announcementId", getComments);
router.get("/:studentId", getStudentAnnouncements);
router.post("/comment/:announcementId", addComment);
router.post("/like/:announcementId", toggleLike);

module.exports = router;