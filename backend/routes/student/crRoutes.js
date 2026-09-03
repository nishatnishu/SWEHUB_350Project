const express = require("express");
const router = express.Router();

const {
  getCRDashboard,
  getAvailableCourses,
  addClass,
  editClass,
  deleteClass,
  getChangeLogs,
  setCR
} = require("../../controllers/student/crController");

// CR Dashboard
router.get("/cr/dashboard/:batchId/:crId", getCRDashboard);
router.get("/cr/courses", getAvailableCourses);
router.get("/cr/logs/:batchId", getChangeLogs);

// CR Actions (Direct - No Approval)
router.post("/cr/:batchId/:crId/add-class", addClass);
router.put("/cr/:batchId/:crId/edit-class/:classId", editClass);
router.delete("/cr/:batchId/:crId/delete-class/:classId", deleteClass);

// Set CR for batch
router.post("/cr/set-cr/:batchId", setCR);

module.exports = router;