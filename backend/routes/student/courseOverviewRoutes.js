const express = require("express");
const router = express.Router();

const {
  getSemesters,
  getCoursesBySemester,
  getCourseDetails
} = require("../../controllers/student/courseOverviewController");

router.get("/semesters", getSemesters);
router.get("/semesters/:semesterId/courses", getCoursesBySemester);
router.get("/courses/:courseId", getCourseDetails);

module.exports = router;