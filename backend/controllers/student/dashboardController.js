const db = require("../../config/db");

const getDashboard = (req, res) => {
  const totalCoursesSql = "SELECT COUNT(*) as total FROM assignments";
  const assignmentsSql = "SELECT COUNT(*) as total FROM assignments WHERE status = 'open'";
  
  db.query(totalCoursesSql, (err, courseResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    db.query(assignmentsSql, (err, assignmentResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({
        totalCourses: courseResult[0].total || 0,
        assignments: assignmentResult[0].total || 0,
        notifications: 5
      });
    });
  });
};

module.exports = { getDashboard };