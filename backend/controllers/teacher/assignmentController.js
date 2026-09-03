// const db = require("../../config/db");

// // Get all courses taught by a teacher
// const getTeacherCourses = (req, res) => {
//   const { teacherId } = req.params;
  
//   const sql = "SELECT * FROM teacher_courses WHERE teacher_id = ?";
  
//   db.query(sql, [teacherId], (err, result) => {
//     if (err) {
//       console.error("Error fetching teacher courses:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// // Get assignments for a specific course (teacher's view)
// const getAssignmentsByCourse = (req, res) => {
//   const { courseCode } = req.params;
//   const { teacherId } = req.query;
  
//   const sql = `
//     SELECT a.*, 
//            (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
//     FROM assignments a
//     WHERE a.course_code = ? AND (a.teacher_id = ? OR a.teacher_id IS NULL)
//     ORDER BY a.created_at DESC
//   `;
  
//   db.query(sql, [courseCode, teacherId], (err, result) => {
//     if (err) {
//       console.error("Error fetching assignments:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// // Add new assignment (teacher creates)
// const addAssignment = (req, res) => {
//   const { teacherId } = req.params;
//   const { title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty } = req.body;
  
//   if (!title || !course_code || !deadline) {
//     return res.status(400).json({ error: "Title, course, and deadline are required" });
//   }
  
//   // Verify teacher teaches this course
//   const checkSql = "SELECT * FROM teacher_courses WHERE teacher_id = ? AND course_code = ?";
  
//   db.query(checkSql, [teacherId, course_code], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You are not authorized to add assignments for this course" });
//     }
    
//     const insertSql = `
//       INSERT INTO assignments (title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, status, teacher_id, assigned_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, CURDATE())
//     `;
    
//     db.query(insertSql, [title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, teacherId], (err, result) => {
//       if (err) {
//         console.error("Error adding assignment:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Assignment added successfully", assignmentId: result.insertId });
//     });
//   });
// };

// // Delete assignment (only if teacher created it)
// const deleteAssignment = (req, res) => {
//   const { teacherId, assignmentId } = req.params;
  
//   // Check if teacher owns this assignment
//   const checkSql = "SELECT id, course_code FROM assignments WHERE id = ? AND teacher_id = ?";
  
//   db.query(checkSql, [assignmentId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only delete assignments you created" });
//     }
    
//     // Delete the assignment
//     const deleteSql = "DELETE FROM assignments WHERE id = ?";
    
//     db.query(deleteSql, [assignmentId], (err, result) => {
//       if (err) {
//         console.error("Error deleting assignment:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Assignment deleted successfully" });
//     });
//   });
// };

// // Get submissions for an assignment (teacher view)
// const getSubmissions = (req, res) => {
//   const { teacherId, assignmentId } = req.params;
  
//   // Verify teacher owns this assignment
//   const checkSql = "SELECT id FROM assignments WHERE id = ? AND teacher_id = ?";
  
//   db.query(checkSql, [assignmentId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only view submissions for your assignments" });
//     }
    
//     const submissionsSql = `
//       SELECT s.*, u.name as student_full_name
//       FROM assignment_submissions s
//       JOIN users u ON s.student_id = u.user_id
//       WHERE s.assignment_id = ?
//       ORDER BY s.submission_date DESC
//     `;
    
//     db.query(submissionsSql, [assignmentId], (err, submissions) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json(submissions);
//     });
//   });
// };

// // Grade a submission
// const gradeSubmission = (req, res) => {
//   const { teacherId, submissionId } = req.params;
//   const { grade, feedback } = req.body;
  
//   // Get assignment info to verify teacher ownership
//   const checkSql = `
//     SELECT a.id FROM assignments a
//     JOIN assignment_submissions s ON a.id = s.assignment_id
//     WHERE s.id = ? AND a.teacher_id = ?
//   `;
  
//   db.query(checkSql, [submissionId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only grade submissions for your assignments" });
//     }
    
//     const updateSql = `
//       UPDATE assignment_submissions 
//       SET grade = ?, feedback = ?, graded_by = ?, graded_date = NOW()
//       WHERE id = ?
//     `;
    
//     db.query(updateSql, [grade, feedback, teacherId, submissionId], (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Grade submitted successfully" });
//     });
//   });
// };

// module.exports = {
//   getTeacherCourses,
//   getAssignmentsByCourse,
//   addAssignment,
//   deleteAssignment,
//   getSubmissions,
//   gradeSubmission
// };



// const db = require("../../config/db");

// // Get all courses taught by a teacher
// const getTeacherCourses = (req, res) => {
//   const { teacherId } = req.params;
  
//   const sql = "SELECT * FROM teacher_courses WHERE teacher_id = ?";
  
//   db.query(sql, [teacherId], (err, result) => {
//     if (err) {
//       console.error("Error fetching teacher courses:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// // Get assignments for a specific course (teacher's view)
// const getAssignmentsByCourse = (req, res) => {
//   const { courseCode } = req.params;
//   const { teacherId } = req.query;
  
//   const sql = `
//     SELECT a.*, 
//            (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
//     FROM assignments a
//     WHERE a.course_code = ? AND (a.teacher_id = ? OR a.teacher_id IS NULL)
//     ORDER BY a.created_at DESC
//   `;
  
//   db.query(sql, [courseCode, teacherId], (err, result) => {
//     if (err) {
//       console.error("Error fetching assignments:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// // Add new assignment (teacher creates)
// const addAssignment = (req, res) => {
//   const { teacherId } = req.params;
//   const { title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty } = req.body;
  
//   if (!title || !course_code || !deadline) {
//     return res.status(400).json({ error: "Title, course, and deadline are required" });
//   }
  
//   // Verify teacher teaches this course
//   const checkSql = "SELECT * FROM teacher_courses WHERE teacher_id = ? AND course_code = ?";
  
//   db.query(checkSql, [teacherId, course_code], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You are not authorized to add assignments for this course" });
//     }
    
//     const insertSql = `
//       INSERT INTO assignments (title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, status, teacher_id, assigned_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, CURDATE())
//     `;
    
//     db.query(insertSql, [title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, teacherId], (err, result) => {
//       if (err) {
//         console.error("Error adding assignment:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Assignment added successfully", assignmentId: result.insertId });
//     });
//   });
// };

// // Delete assignment (only if teacher created it)
// const deleteAssignment = (req, res) => {
//   const { teacherId, assignmentId } = req.params;
  
//   // Check if teacher owns this assignment
//   const checkSql = "SELECT id, course_code FROM assignments WHERE id = ? AND teacher_id = ?";
  
//   db.query(checkSql, [assignmentId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only delete assignments you created" });
//     }
    
//     // Delete the assignment
//     const deleteSql = "DELETE FROM assignments WHERE id = ?";
    
//     db.query(deleteSql, [assignmentId], (err, result) => {
//       if (err) {
//         console.error("Error deleting assignment:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Assignment deleted successfully" });
//     });
//   });
// };

// // Get submissions for an assignment (teacher view)
// const getSubmissions = (req, res) => {
//   const { teacherId, assignmentId } = req.params;
  
//   // Verify teacher owns this assignment
//   const checkSql = "SELECT id FROM assignments WHERE id = ? AND teacher_id = ?";
  
//   db.query(checkSql, [assignmentId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only view submissions for your assignments" });
//     }
    
//     const submissionsSql = `
//       SELECT s.*, u.name as student_name, u.email as student_email
//       FROM assignment_submissions s
//       JOIN users u ON s.student_id = u.user_id
//       WHERE s.assignment_id = ?
//       ORDER BY s.submission_date DESC
//     `;
    
//     db.query(submissionsSql, [assignmentId], (err, submissions) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json(submissions);
//     });
//   });
// };

// // Grade a submission
// const gradeSubmission = (req, res) => {
//   const { teacherId, submissionId } = req.params;
//   const { grade, feedback } = req.body;
  
//   // Get assignment info to verify teacher ownership
//   const checkSql = `
//     SELECT a.id FROM assignments a
//     JOIN assignment_submissions s ON a.id = s.assignment_id
//     WHERE s.id = ? AND a.teacher_id = ?
//   `;
  
//   db.query(checkSql, [submissionId, teacherId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(403).json({ error: "You can only grade submissions for your assignments" });
//     }
    
//     const updateSql = `
//       UPDATE assignment_submissions 
//       SET grade = ?, feedback = ?, graded_by = ?, graded_date = NOW()
//       WHERE id = ?
//     `;
    
//     db.query(updateSql, [grade, feedback, teacherId, submissionId], (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       res.json({ success: true, message: "Grade submitted successfully" });
//     });
//   });
// };

// module.exports = {
//   getTeacherCourses,
//   getAssignmentsByCourse,
//   addAssignment,
//   deleteAssignment,
//   getSubmissions,
//   gradeSubmission
// };





const db = require("../../config/db");

// Get all courses taught by a teacher
const getTeacherCourses = (req, res) => {
  const { teacherId } = req.params;
  
  const sql = "SELECT * FROM teacher_courses WHERE teacher_id = ?";
  
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error("Error fetching teacher courses:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Get assignments for a specific course (teacher's view) with deadline status
const getAssignmentsByCourse = (req, res) => {
  const { courseCode } = req.params;
  const { teacherId } = req.query;
  
  const sql = `
    SELECT a.*, 
           (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count,
           CASE 
             WHEN a.status = 'closed' THEN 'closed'
             WHEN a.deadline < NOW() THEN 'passed'
             WHEN a.deadline >= NOW() THEN 'active'
             ELSE 'unknown'
           END as deadline_status
    FROM assignments a
    WHERE a.course_code = ? AND (a.teacher_id = ? OR a.teacher_id IS NULL)
    ORDER BY a.created_at DESC
  `;
  
  db.query(sql, [courseCode, teacherId], (err, result) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Add new assignment (teacher creates)
const addAssignment = (req, res) => {
  const { teacherId } = req.params;
  const { title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty } = req.body;
  
  if (!title || !course_code || !deadline) {
    return res.status(400).json({ error: "Title, course, and deadline are required" });
  }
  
  // Verify teacher teaches this course
  const checkSql = "SELECT * FROM teacher_courses WHERE teacher_id = ? AND course_code = ?";
  
  db.query(checkSql, [teacherId, course_code], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "You are not authorized to add assignments for this course" });
    }
    
    const insertSql = `
      INSERT INTO assignments (title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, status, teacher_id, assigned_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, CURDATE())
    `;
    
    db.query(insertSql, [title, description, course_code, course_name, type, deadline, weightage, max_score, late_penalty, teacherId], (err, result) => {
      if (err) {
        console.error("Error adding assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Assignment added successfully", assignmentId: result.insertId });
    });
  });
};

// Delete assignment (only if teacher created it)
const deleteAssignment = (req, res) => {
  const { teacherId, assignmentId } = req.params;
  
  // Check if teacher owns this assignment
  const checkSql = "SELECT id, course_code FROM assignments WHERE id = ? AND teacher_id = ?";
  
  db.query(checkSql, [assignmentId, teacherId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "You can only delete assignments you created" });
    }
    
    // Delete the assignment
    const deleteSql = "DELETE FROM assignments WHERE id = ?";
    
    db.query(deleteSql, [assignmentId], (err, result) => {
      if (err) {
        console.error("Error deleting assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Assignment deleted successfully" });
    });
  });
};

// Get submissions for an assignment (teacher view)
const getSubmissions = (req, res) => {
  const { teacherId, assignmentId } = req.params;
  
  // Verify teacher owns this assignment
  const checkSql = "SELECT id FROM assignments WHERE id = ? AND teacher_id = ?";
  
  db.query(checkSql, [assignmentId, teacherId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "You can only view submissions for your assignments" });
    }
    
    const submissionsSql = `
      SELECT s.*, u.name as student_name, u.email as student_email
      FROM assignment_submissions s
      JOIN users u ON s.student_id = u.user_id
      WHERE s.assignment_id = ?
      ORDER BY s.submission_date DESC
    `;
    
    db.query(submissionsSql, [assignmentId], (err, submissions) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json(submissions);
    });
  });
};

// Grade a submission
const gradeSubmission = (req, res) => {
  const { teacherId, submissionId } = req.params;
  const { grade, feedback } = req.body;
  
  // Get assignment info to verify teacher ownership
  const checkSql = `
    SELECT a.id FROM assignments a
    JOIN assignment_submissions s ON a.id = s.assignment_id
    WHERE s.id = ? AND a.teacher_id = ?
  `;
  
  db.query(checkSql, [submissionId, teacherId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "You can only grade submissions for your assignments" });
    }
    
    const updateSql = `
      UPDATE assignment_submissions 
      SET grade = ?, feedback = ?, graded_by = ?, graded_date = NOW()
      WHERE id = ?
    `;
    
    db.query(updateSql, [grade, feedback, teacherId, submissionId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Grade submitted successfully" });
    });
  });
};

module.exports = {
  getTeacherCourses,
  getAssignmentsByCourse,
  addAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission
};