const db = require("../../config/db");

// Get CR dashboard data
const getCRDashboard = (req, res) => {
  const { batchId, crId } = req.params;
  
  // Verify CR authorization
  const checkSql = "SELECT * FROM batches WHERE id = ? AND cr_id = ?";
  
  db.query(checkSql, [batchId, crId], (err, batchResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (batchResult.length === 0) {
      return res.status(403).json({ error: "You are not authorized for this batch" });
    }
    
    // Get current routine
    const routineSql = `
      SELECT * FROM class_routine 
      WHERE batch_id = ?
      ORDER BY FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'), start_time
    `;
    
    db.query(routineSql, [batchId], (err, routineResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({
        batch: batchResult[0],
        routine: routineResult
      });
    });
  });
};

// Get available courses
const getAvailableCourses = (req, res) => {
  const sql = "SELECT id, course_code, course_name FROM courses ORDER BY course_code";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Add new class (Direct)
const addClass = (req, res) => {
  const { batchId, crId } = req.params;
  const { course_code, course_name, instructor_name, day_of_week, start_time, end_time, room, platform, meeting_link } = req.body;
  
  // Verify CR authorization
  const checkSql = "SELECT id, batch_name FROM batches WHERE id = ? AND cr_id = ?";
  
  db.query(checkSql, [batchId, crId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    // Get course_id
    const getCourseSql = "SELECT id FROM courses WHERE course_code = ?";
    
    db.query(getCourseSql, [course_code], (err, courseResult) => {
      let courseId = null;
      if (courseResult.length > 0) {
        courseId = courseResult[0].id;
      }
      
      // Insert directly into class_routine
      const insertSql = `
        INSERT INTO class_routine (batch_id, course_id, course_code, course_name, instructor_name, day_of_week, start_time, end_time, room, platform, meeting_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(insertSql, [batchId, courseId, course_code, course_name, instructor_name, day_of_week, start_time, end_time, room, platform, meeting_link], (err, insertResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        
        // Log the change
        const logSql = `
          INSERT INTO routine_change_log (batch_id, cr_id, action_type, course_code, course_name, change_details)
          VALUES (?, ?, 'add', ?, ?, ?)
        `;
        
        const details = `Added class: ${course_code} - ${course_name} on ${day_of_week} at ${start_time}`;
        
        db.query(logSql, [batchId, crId, course_code, course_name, details], (err) => {
          if (err) console.error("Log error:", err);
        });
        
        res.json({ success: true, message: "Class added successfully" });
      });
    });
  });
};

// Edit existing class (Direct)
const editClass = (req, res) => {
  const { batchId, crId, classId } = req.params;
  const { course_code, course_name, instructor_name, day_of_week, start_time, end_time, room, platform, meeting_link } = req.body;
  
  // Verify CR authorization
  const checkSql = "SELECT id FROM batches WHERE id = ? AND cr_id = ?";
  
  db.query(checkSql, [batchId, crId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    // Get old data for log
    const getOldSql = "SELECT * FROM class_routine WHERE id = ?";
    
    db.query(getOldSql, [classId], (err, oldData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      // Update the class
      const updateSql = `
        UPDATE class_routine 
        SET course_code = ?, course_name = ?, instructor_name = ?, day_of_week = ?, 
            start_time = ?, end_time = ?, room = ?, platform = ?, meeting_link = ?
        WHERE id = ? AND batch_id = ?
      `;
      
      db.query(updateSql, [course_code, course_name, instructor_name, day_of_week, start_time, end_time, room, platform, meeting_link, classId, batchId], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        
        // Log the change
        const logSql = `
          INSERT INTO routine_change_log (batch_id, cr_id, action_type, course_code, course_name, change_details)
          VALUES (?, ?, 'edit', ?, ?, ?)
        `;
        
        const details = `Edited class: ${course_code} - ${course_name}. Changed from ${oldData[0]?.day_of_week} ${oldData[0]?.start_time} to ${day_of_week} ${start_time}`;
        
        db.query(logSql, [batchId, crId, course_code, course_name, details], (err) => {
          if (err) console.error("Log error:", err);
        });
        
        res.json({ success: true, message: "Class updated successfully" });
      });
    });
  });
};

// Delete class (Direct)
const deleteClass = (req, res) => {
  const { batchId, crId, classId } = req.params;
  const { reason } = req.body;
  
  // Verify CR authorization
  const checkSql = "SELECT id FROM batches WHERE id = ? AND cr_id = ?";
  
  db.query(checkSql, [batchId, crId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    // Get class data for log
    const getClassSql = "SELECT * FROM class_routine WHERE id = ?";
    
    db.query(getClassSql, [classId], (err, classData) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      // Delete the class
      const deleteSql = "DELETE FROM class_routine WHERE id = ? AND batch_id = ?";
      
      db.query(deleteSql, [classId, batchId], (err, deleteResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        
        // Log the change
        const logSql = `
          INSERT INTO routine_change_log (batch_id, cr_id, action_type, course_code, course_name, change_details)
          VALUES (?, ?, 'delete', ?, ?, ?)
        `;
        
        const details = `Deleted class: ${classData[0]?.course_code} - ${classData[0]?.course_name}. Reason: ${reason || 'No reason provided'}`;
        
        db.query(logSql, [batchId, crId, classData[0]?.course_code, classData[0]?.course_name, details], (err) => {
          if (err) console.error("Log error:", err);
        });
        
        res.json({ success: true, message: "Class deleted successfully" });
      });
    });
  });
};

// Get change logs
const getChangeLogs = (req, res) => {
  const { batchId } = req.params;
  
  const sql = `
    SELECT * FROM routine_change_log 
    WHERE batch_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `;
  
  db.query(sql, [batchId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// Set CR for a batch
const setCR = (req, res) => {
  const { batchId } = req.params;
  const { cr_id, cr_name } = req.body;
  
  const sql = "UPDATE batches SET cr_id = ?, cr_name = ? WHERE id = ?";
  
  db.query(sql, [cr_id, cr_name, batchId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: "CR assigned successfully" });
  });
};

module.exports = {
  getCRDashboard,
  getAvailableCourses,
  addClass,
  editClass,
  deleteClass,
  getChangeLogs,
  setCR
};