const express = require("express");
const router = express.Router();

const {
  getBatches,
  getTeacherClassesByBatch,
  getTeacherWeeklySchedule,
  getTeacherTodaysClasses,
  startLiveSession,
  endLiveSession,
  addRecording,
  getTeacherLiveSessions,
  getTeacherRecordings,
  updateMeetingLink
} = require("../../controllers/teacher/liveSessionController");

// GET routes
router.get("/batches", getBatches);
router.get("/classes/:teacherId/:batchId", getTeacherClassesByBatch);
router.get("/weekly-schedule/:teacherId", getTeacherWeeklySchedule);
router.get("/todays-classes/:teacherId", getTeacherTodaysClasses);
router.get("/live-sessions/:teacherId", getTeacherLiveSessions);
router.get("/recordings/:teacherId", getTeacherRecordings);

// POST routes
router.post("/start-live/:classId", startLiveSession);
router.post("/end-live/:sessionId", endLiveSession);
router.post("/add-recording/:sessionId", addRecording);
router.post("/update-meeting-link/:classId", updateMeetingLink);

module.exports = router;