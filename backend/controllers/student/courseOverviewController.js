const db = require("../../config/db");

// Get all semesters with course counts
const getSemesters = (req, res) => {
  const sql = `
    SELECT 
      s.*,
      COUNT(cs.course_id) as course_count,
      SUM(c.credits) as total_credits,
      SUM(c.hours_per_week) as total_hours
    FROM semesters s
    LEFT JOIN course_semester cs ON s.id = cs.semester_id
    LEFT JOIN courses c ON cs.course_id = c.id
    GROUP BY s.id
    ORDER BY s.semester_order ASC
  `;
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching semesters:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Get courses by semester
const getCoursesBySemester = (req, res) => {
  const { semesterId } = req.params;
  
  const sql = `
    SELECT 
      c.*,
      cs.is_elective,
      cs.is_mandatory
    FROM courses c
    JOIN course_semester cs ON c.id = cs.course_id
    WHERE cs.semester_id = ?
    ORDER BY c.course_code ASC
  `;
  
  db.query(sql, [semesterId], (err, result) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Get single course details
const getCourseDetails = (req, res) => {
  const { courseId } = req.params;
  
  const sql = `
    SELECT 
      c.*,
      s.semester_code,
      s.semester_name
    FROM courses c
    JOIN course_semester cs ON c.id = cs.course_id
    JOIN semesters s ON cs.semester_id = s.id
    WHERE c.id = ?
  `;
  
  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    res.json(result[0]);
  });
};

module.exports = {
  getSemesters,
  getCoursesBySemester,
  getCourseDetails
};