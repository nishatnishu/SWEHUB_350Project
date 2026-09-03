const express = require("express");
const router = express.Router();

const {
  getBatches,
  getRoutineByBatch,
  getWeeklySchedule,
  getTodaysSessions,
  getLiveSessions,
  getRecentRecordings,
  markAttendance,
  joinSession,
  getSessionInfo
} = require("../../controllers/student/liveSessionController");

// GET routes
router.get("/batches", getBatches);
router.get("/routine/:batchId", getRoutineByBatch);
router.get("/weekly-schedule/:batchId", getWeeklySchedule);
router.get("/todays-sessions/:batchId", getTodaysSessions);
router.get("/live-session/:batchId", getLiveSessions);
router.get("/recordings/:batchId", getRecentRecordings);
router.get("/session-info/:sessionId", getSessionInfo);

// POST routes
router.post("/attendance/:sessionId", markAttendance);
router.post("/join-session/:sessionId", joinSession);

module.exports = router;