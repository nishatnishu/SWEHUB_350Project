// const express = require("express");
// const router = express.Router();

// const {
//   getTeacherCourses,
//   getAssignmentsByCourse,
//   addAssignment,
//   deleteAssignment,
//   getSubmissions,
//   gradeSubmission
// } = require("../../controllers/teacher/assignmentController");

// router.get("/courses/:teacherId", getTeacherCourses);
// router.get("/assignments/:courseCode", getAssignmentsByCourse);
// router.post("/add-assignment/:teacherId", addAssignment);
// router.delete("/delete-assignment/:teacherId/:assignmentId", deleteAssignment);
// router.get("/submissions/:teacherId/:assignmentId", getSubmissions);
// router.post("/grade/:teacherId/:submissionId", gradeSubmission);

// module.exports = router;


// const express = require("express");
// const router = express.Router();

// const {
//   getTeacherCourses,
//   getAssignmentsByCourse,
//   addAssignment,
//   deleteAssignment,
//   getSubmissions,
//   gradeSubmission
// } = require("../../controllers/teacher/assignmentController");

// router.get("/courses/:teacherId", getTeacherCourses);
// router.get("/assignments/:courseCode", getAssignmentsByCourse);
// router.post("/add-assignment/:teacherId", addAssignment);
// router.delete("/delete-assignment/:teacherId/:assignmentId", deleteAssignment);
// router.get("/submissions/:teacherId/:assignmentId", getSubmissions);
// router.post("/grade/:teacherId/:submissionId", gradeSubmission);

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
  getTeacherCourses,
  getAssignmentsByCourse,
  addAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission
} = require("../../controllers/teacher/assignmentController");

router.get("/courses/:teacherId", getTeacherCourses);
router.get("/assignments/:courseCode", getAssignmentsByCourse);
router.post("/add-assignment/:teacherId", addAssignment);
router.delete("/delete-assignment/:teacherId/:assignmentId", deleteAssignment);
router.get("/submissions/:teacherId/:assignmentId", getSubmissions);
router.post("/grade/:teacherId/:submissionId", gradeSubmission);

module.exports = router;