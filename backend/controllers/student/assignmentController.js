// const db = require("../../config/db");

// const getAssignments = (req, res) => {
//   const sql = `
//     SELECT 
//       id, 
//       title, 
//       course_name, 
//       type, 
//       DATE_FORMAT(deadline, '%Y-%m-%d') as deadline,
//       status 
//     FROM assignments
//     ORDER BY deadline ASC
//   `;

//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error fetching assignments:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// const getAssignmentById = (req, res) => {
//   const { id } = req.params;
  
//   const assignmentSql = `
//     SELECT 
//       id,
//       title,
//       description,
//       course_code,
//       course_name,
//       type,
//       submission_mode,
//       DATE_FORMAT(assigned_date, '%Y-%m-%d') as assigned_date,
//       DATE_FORMAT(deadline, '%Y-%m-%d %H:%i:%s') as deadline,
//       weightage,
//       max_score,
//       late_penalty,
//       status
//     FROM assignments 
//     WHERE id = ?
//   `;

//   db.query(assignmentSql, [id], (err, assignmentResult) => {
//     if (err) {
//       console.error("Error fetching assignment:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (assignmentResult.length === 0) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }

//     const assignment = assignmentResult[0];

//     const resourcesSql = `
//       SELECT 
//         id,
//         file_name,
//         file_size,
//         file_type,
//         file_url,
//         DATE_FORMAT(upload_date, '%Y-%m-%d') as upload_date
//       FROM assignment_resources 
//       WHERE assignment_id = ?
//     `;

//     db.query(resourcesSql, [id], (err, resourcesResult) => {
//       if (err) {
//         console.error("Error fetching resources:", err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       const studentId = req.query.student_id || 'STU001';
      
//       const submissionsSql = `
//         SELECT 
//           id,
//           DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') as submission_date,
//           file_name,
//           file_url,
//           text_submission,
//           status,
//           grade,
//           feedback
//         FROM assignment_submissions 
//         WHERE assignment_id = ? AND student_id = ?
//         ORDER BY submission_date DESC
//       `;

//       db.query(submissionsSql, [id, studentId], (err, submissionsResult) => {
//         if (err) {
//           console.error("Error fetching submissions:", err);
//           return res.status(500).json({ error: "Database error" });
//         }

//         res.json({
//           ...assignment,
//           resources: resourcesResult,
//           submissions: submissionsResult,
//           student_id: studentId
//         });
//       });
//     });
//   });
// };

// const submitAssignment = (req, res) => {
//   const { id } = req.params;
//   const { student_id, student_name, text_submission } = req.body;
//   const uploadedFile = req.file;

//   if (!student_id) {
//     return res.status(400).json({ error: "Student ID is required" });
//   }

//   if (!uploadedFile && !text_submission) {
//     return res.status(400).json({ error: "Please upload a file or add text submission" });
//   }

//   const checkSql = "SELECT status FROM assignments WHERE id = ?";
  
//   db.query(checkSql, [id], (err, result) => {
//     if (err) {
//       console.error("Error checking assignment:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }
    
//     if (result[0].status !== 'open') {
//       return res.status(400).json({ error: "Assignment is not open for submissions" });
//     }
    
//     const checkSubmissionSql = "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?";
    
//     db.query(checkSubmissionSql, [id, student_id], (err, submissionResult) => {
//       if (err) {
//         console.error("Error checking submission:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       if (submissionResult.length > 0) {
//         return res.status(400).json({ error: "You have already submitted this assignment" });
//       }
      
//       let fileUrl = null;
//       let fileName = null;
      
//       if (uploadedFile) {
//         fileUrl = `/submissions/${uploadedFile.filename}`;
//         fileName = uploadedFile.originalname;
//       }
      
//       const insertSql = `
//         INSERT INTO assignment_submissions 
//         (assignment_id, student_id, student_name, file_url, file_name, text_submission, status)
//         VALUES (?, ?, ?, ?, ?, ?, 'submitted')
//       `;
      
//       db.query(insertSql, [id, student_id, student_name || 'Student', fileUrl, fileName, text_submission || null], (err, result) => {
//         if (err) {
//           console.error("Error submitting assignment:", err);
//           return res.status(500).json({ error: "Database error" });
//         }
        
//         res.json({ 
//           success: true, 
//           message: "Assignment submitted successfully", 
//           submission_id: result.insertId
//         });
//       });
//     });
//   });
// };

// module.exports = { getAssignments, getAssignmentById, submitAssignment };


// const db = require("../../config/db");

// // GET all assignments
// const getAssignments = (req, res) => {
//   const sql = `
//     SELECT 
//       id, 
//       title, 
//       course_name, 
//       type, 
//       DATE_FORMAT(deadline, '%Y-%m-%d') as deadline,
//       status 
//     FROM assignments
//     ORDER BY deadline ASC
//   `;

//   db.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error fetching assignments:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
//     res.json(result);
//   });
// };

// // GET single assignment with full details
// const getAssignmentById = (req, res) => {
//   const { id } = req.params;
  
//   const assignmentSql = `
//     SELECT 
//       id,
//       title,
//       description,
//       course_code,
//       course_name,
//       type,
//       submission_mode,
//       DATE_FORMAT(assigned_date, '%Y-%m-%d') as assigned_date,
//       DATE_FORMAT(deadline, '%Y-%m-%d %H:%i:%s') as deadline,
//       weightage,
//       max_score,
//       late_penalty,
//       status
//     FROM assignments 
//     WHERE id = ?
//   `;

//   db.query(assignmentSql, [id], (err, assignmentResult) => {
//     if (err) {
//       console.error("Error fetching assignment:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (assignmentResult.length === 0) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }

//     const assignment = assignmentResult[0];

//     const resourcesSql = `
//       SELECT 
//         id,
//         file_name,
//         file_size,
//         file_type,
//         file_url,
//         DATE_FORMAT(upload_date, '%Y-%m-%d') as upload_date
//       FROM assignment_resources 
//       WHERE assignment_id = ?
//     `;

//     db.query(resourcesSql, [id], (err, resourcesResult) => {
//       if (err) {
//         console.error("Error fetching resources:", err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       const studentId = req.query.student_id || 'STU001';
      
//       const submissionsSql = `
//         SELECT 
//           id,
//           DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') as submission_date,
//           file_name,
//           file_url,
//           text_submission,
//           status,
//           grade,
//           feedback
//         FROM assignment_submissions 
//         WHERE assignment_id = ? AND student_id = ?
//         ORDER BY submission_date DESC
//       `;

//       db.query(submissionsSql, [id, studentId], (err, submissionsResult) => {
//         if (err) {
//           console.error("Error fetching submissions:", err);
//           return res.status(500).json({ error: "Database error" });
//         }

//         res.json({
//           ...assignment,
//           resources: resourcesResult,
//           submissions: submissionsResult,
//           student_id: studentId
//         });
//       });
//     });
//   });
// };

// // POST submit assignment with file upload
// const submitAssignment = (req, res) => {
//   const { id } = req.params;
//   const { student_id, student_name, text_submission } = req.body;
//   const uploadedFile = req.file;

//   if (!student_id) {
//     return res.status(400).json({ error: "Student ID is required" });
//   }

//   if (!uploadedFile && !text_submission) {
//     return res.status(400).json({ error: "Please upload a file or add text submission" });
//   }

//   const checkSql = "SELECT status, title FROM assignments WHERE id = ?";
  
//   db.query(checkSql, [id], (err, result) => {
//     if (err) {
//       console.error("Error checking assignment:", err);
//       return res.status(500).json({ error: "Database error" });
//     }
    
//     if (result.length === 0) {
//       return res.status(404).json({ error: "Assignment not found" });
//     }
    
//     if (result[0].status !== 'open') {
//       return res.status(400).json({ error: "Assignment is not open for submissions" });
//     }
    
//     const checkSubmissionSql = "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?";
    
//     db.query(checkSubmissionSql, [id, student_id], (err, submissionResult) => {
//       if (err) {
//         console.error("Error checking submission:", err);
//         return res.status(500).json({ error: "Database error" });
//       }
      
//       if (submissionResult.length > 0) {
//         return res.status(400).json({ error: "You have already submitted this assignment" });
//       }
      
//       let fileUrl = null;
//       let fileName = null;
      
//       if (uploadedFile) {
//         fileUrl = `/submissions/${uploadedFile.filename}`;
//         fileName = uploadedFile.originalname;
//       }
      
//       const insertSql = `
//         INSERT INTO assignment_submissions 
//         (assignment_id, student_id, student_name, file_url, file_name, text_submission, status, submission_date)
//         VALUES (?, ?, ?, ?, ?, ?, 'submitted', NOW())
//       `;
      
//       db.query(insertSql, [id, student_id, student_name || 'Student', fileUrl, fileName, text_submission || null], (err, result) => {
//         if (err) {
//           console.error("Error submitting assignment:", err);
//           return res.status(500).json({ error: "Database error" });
//         }
        
//         res.json({ 
//           success: true, 
//           message: "Assignment submitted successfully", 
//           submission_id: result.insertId
//         });
//       });
//     });
//   });
// };

// module.exports = { getAssignments, getAssignmentById, submitAssignment };



const db = require("../../config/db");

// GET all assignments with deadline status
const getAssignments = (req, res) => {
  const sql = `
    SELECT 
      id, 
      title, 
      description,
      course_code,
      course_name, 
      type, 
      deadline,
      DATE_FORMAT(deadline, '%Y-%m-%d') as deadline_date,
      status,
      weightage,
      max_score,
      late_penalty,
      CASE 
        WHEN status = 'closed' THEN 'closed'
        WHEN deadline < NOW() THEN 'passed'
        WHEN deadline >= NOW() THEN 'open'
        ELSE 'unknown'
      END as deadline_status
    FROM assignments
    ORDER BY deadline ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET single assignment with full details
const getAssignmentById = (req, res) => {
  const { id } = req.params;
  
  const assignmentSql = `
    SELECT 
      id,
      title,
      description,
      course_code,
      course_name,
      type,
      submission_mode,
      DATE_FORMAT(assigned_date, '%Y-%m-%d') as assigned_date,
      deadline,
      DATE_FORMAT(deadline, '%Y-%m-%d %H:%i:%s') as formatted_deadline,
      weightage,
      max_score,
      late_penalty,
      status,
      CASE 
        WHEN status = 'closed' THEN 'closed'
        WHEN deadline < NOW() THEN 'passed'
        WHEN deadline >= NOW() THEN 'open'
        ELSE 'unknown'
      END as deadline_status
    FROM assignments 
    WHERE id = ?
  `;

  db.query(assignmentSql, [id], (err, assignmentResult) => {
    if (err) {
      console.error("Error fetching assignment:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (assignmentResult.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignment = assignmentResult[0];

    const resourcesSql = `
      SELECT 
        id,
        file_name,
        file_size,
        file_type,
        file_url,
        DATE_FORMAT(upload_date, '%Y-%m-%d') as upload_date
      FROM assignment_resources 
      WHERE assignment_id = ?
    `;

    db.query(resourcesSql, [id], (err, resourcesResult) => {
      if (err) {
        console.error("Error fetching resources:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const studentId = req.query.student_id || 'STU001';
      
      const submissionsSql = `
        SELECT 
          id,
          DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') as submission_date,
          file_name,
          file_url,
          text_submission,
          status,
          grade,
          feedback
        FROM assignment_submissions 
        WHERE assignment_id = ? AND student_id = ?
        ORDER BY submission_date DESC
      `;

      db.query(submissionsSql, [id, studentId], (err, submissionsResult) => {
        if (err) {
          console.error("Error fetching submissions:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          ...assignment,
          resources: resourcesResult,
          submissions: submissionsResult,
          student_id: studentId
        });
      });
    });
  });
};

// POST submit assignment with file upload
const submitAssignment = (req, res) => {
  const { id } = req.params;
  const { student_id, student_name, text_submission } = req.body;
  const uploadedFile = req.file;

  if (!student_id) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  if (!uploadedFile && !text_submission) {
    return res.status(400).json({ error: "Please upload a file or add text submission" });
  }

  const checkSql = "SELECT status, deadline FROM assignments WHERE id = ?";
  
  db.query(checkSql, [id], (err, result) => {
    if (err) {
      console.error("Error checking assignment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    const assignment = result[0];
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isDeadlinePassed = now > deadline;
    
    if (assignment.status !== 'open' || isDeadlinePassed) {
      return res.status(400).json({ error: "Assignment is not open for submissions or deadline has passed" });
    }
    
    const checkSubmissionSql = "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?";
    
    db.query(checkSubmissionSql, [id, student_id], (err, submissionResult) => {
      if (err) {
        console.error("Error checking submission:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (submissionResult.length > 0) {
        return res.status(400).json({ error: "You have already submitted this assignment" });
      }
      
      let fileUrl = null;
      let fileName = null;
      
      if (uploadedFile) {
        fileUrl = `/submissions/${uploadedFile.filename}`;
        fileName = uploadedFile.originalname;
      }
      
      const insertSql = `
        INSERT INTO assignment_submissions 
        (assignment_id, student_id, student_name, file_url, file_name, text_submission, status, submission_date)
        VALUES (?, ?, ?, ?, ?, ?, 'submitted', NOW())
      `;
      
      db.query(insertSql, [id, student_id, student_name || 'Student', fileUrl, fileName, text_submission || null], (err, result) => {
        if (err) {
          console.error("Error submitting assignment:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        res.json({ 
          success: true, 
          message: "Assignment submitted successfully", 
          submission_id: result.insertId
        });
      });
    });
  });
};

module.exports = { getAssignments, getAssignmentById, submitAssignment };