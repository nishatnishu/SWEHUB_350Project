const db = require("../../config/db");

// Get all batches
const getBatches = (req, res) => {
  const sql = "SELECT id, batch_name, batch_year FROM batches WHERE is_active = TRUE ORDER BY batch_year DESC";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching batches:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};

// Get teacher's classes for a specific batch
const getTeacherClassesByBatch = (req, res) => {
  const { teacherId, batchId } = req.params;
  
  console.log("Fetching classes for teacher:", teacherId, "batch:", batchId);
  
  if (!teacherId || !batchId) {
    return res.status(400).json({ error: "Teacher ID and Batch ID are required" });
  }
  
  // First get the teacher's name
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (teacherResult.length === 0) {
      return res.json([]);
    }
    
    const teacherName = teacherResult[0].name;
    
    const sql = `
      SELECT 
        cr.id,
        cr.course_code,
        cr.course_name,
        cr.instructor_name,
        cr.day_of_week,
        TIME_FORMAT(cr.start_time, '%h:%i %p') as start_time,
        TIME_FORMAT(cr.end_time, '%h:%i %p') as end_time,
        TIME_FORMAT(cr.start_time, '%H:%i:%s') as start_time_raw,
        TIME_FORMAT(cr.end_time, '%H:%i:%s') as end_time_raw,
        cr.room,
        cr.platform,
        cr.meeting_link,
        CASE 
          WHEN TIME(NOW()) BETWEEN cr.start_time AND cr.end_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'ongoing'
          WHEN TIME(NOW()) > cr.end_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'completed'
          WHEN TIME(NOW()) < cr.start_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'upcoming'
          ELSE 'scheduled'
        END as current_status
      FROM class_routine cr
      WHERE cr.batch_id = ? AND cr.instructor_name = ?
    `;
    
    db.query(sql, [batchId, teacherName], (err, result) => {
      if (err) {
        console.error("Error fetching teacher classes:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result || []);
    });
  });
};

// Get weekly schedule for teacher
const getTeacherWeeklySchedule = (req, res) => {
  const { teacherId } = req.params;
  
  console.log("Fetching weekly schedule for teacher:", teacherId);
  
  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (teacherResult.length === 0) {
      return res.json({});
    }
    
    const teacherName = teacherResult[0].name;
    
    const sql = `
      SELECT 
        cr.batch_id,
        b.batch_name,
        cr.day_of_week,
        TIME_FORMAT(cr.start_time, '%H:%i:%s') as start_time,
        TIME_FORMAT(cr.end_time, '%H:%i:%s') as end_time,
        cr.course_code,
        cr.course_name,
        cr.instructor_name,
        cr.room,
        cr.platform,
        cr.meeting_link,
        TIME_FORMAT(cr.start_time, '%h:%i %p') as formatted_start,
        TIME_FORMAT(cr.end_time, '%h:%i %p') as formatted_end,
        CASE 
          WHEN TIME(NOW()) BETWEEN cr.start_time AND cr.end_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'ongoing'
          WHEN TIME(NOW()) > cr.end_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'completed'
          WHEN TIME(NOW()) < cr.start_time AND cr.day_of_week = DAYNAME(NOW()) THEN 'upcoming'
          ELSE 'scheduled'
        END as status
      FROM class_routine cr
      JOIN batches b ON cr.batch_id = b.id
      WHERE cr.instructor_name = ?
      ORDER BY FIELD(cr.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'), cr.start_time
    `;
    
    db.query(sql, [teacherName], (err, result) => {
      if (err) {
        console.error("Error fetching weekly schedule:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      const schedule = {
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: []
      };
      
      (result || []).forEach(row => {
        const day = row.day_of_week;
        if (schedule[day]) {
          schedule[day].push(row);
        }
      });
      
      res.json(schedule);
    });
  });
};

// Get today's classes for teacher
const getTeacherTodaysClasses = (req, res) => {
  const { teacherId } = req.params;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  console.log("Fetching today's classes for teacher:", teacherId, "today:", today);
  
  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (teacherResult.length === 0) {
      return res.json([]);
    }
    
    const teacherName = teacherResult[0].name;
    
    const sql = `
      SELECT 
        cr.id,
        b.batch_name,
        cr.course_code,
        cr.course_name,
        cr.instructor_name,
        TIME_FORMAT(cr.start_time, '%h:%i %p') as start_time,
        TIME_FORMAT(cr.end_time, '%h:%i %p') as end_time,
        TIME_FORMAT(cr.start_time, '%H:%i:%s') as start_time_raw,
        TIME_FORMAT(cr.end_time, '%H:%i:%s') as end_time_raw,
        cr.room,
        cr.platform,
        cr.meeting_link,
        CASE 
          WHEN TIME(NOW()) BETWEEN cr.start_time AND cr.end_time THEN 'ongoing'
          WHEN TIME(NOW()) > cr.end_time THEN 'completed'
          ELSE 'upcoming'
        END as status
      FROM class_routine cr
      JOIN batches b ON cr.batch_id = b.id
      WHERE cr.instructor_name = ? AND cr.day_of_week = ?
      ORDER BY cr.start_time
    `;
    
    db.query(sql, [teacherName, today], (err, result) => {
      if (err) {
        console.error("Error fetching today's classes:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result || []);
    });
  });
};

// Get live sessions
const getTeacherLiveSessions = (req, res) => {
  const { teacherId } = req.params;
  
  console.log("Fetching live sessions for teacher:", teacherId);
  
  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (teacherResult.length === 0) {
      return res.json([]);
    }
    
    const teacherName = teacherResult[0].name;
    
    const sql = `
      SELECT 
        ls.*,
        cr.course_code,
        cr.course_name,
        b.batch_name,
        TIME_FORMAT(ls.start_time, '%h:%i %p') as formatted_start
      FROM live_sessions ls
      JOIN class_routine cr ON ls.routine_id = cr.id
      JOIN batches b ON ls.batch_id = b.id
      WHERE cr.instructor_name = ? AND ls.session_date = CURDATE() AND ls.status = 'live'
      ORDER BY ls.start_time ASC
    `;
    
    db.query(sql, [teacherName], (err, result) => {
      if (err) {
        console.error("Error fetching live sessions:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result || []);
    });
  });
};

// Get recordings
const getTeacherRecordings = (req, res) => {
  const { teacherId } = req.params;
  
  console.log("Fetching recordings for teacher:", teacherId);
  
  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error("Error fetching teacher:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (teacherResult.length === 0) {
      return res.json([]);
    }
    
    const teacherName = teacherResult[0].name;
    
    const sql = `
      SELECT 
        ls.id,
        ls.title,
        ls.instructor_name,
        ls.recording_url,
        ls.session_date,
        cr.course_code,
        cr.course_name,
        b.batch_name,
        DATE_FORMAT(ls.session_date, '%Y-%m-%d') as formatted_date,
        DATEDIFF(NOW(), ls.session_date) as days_ago
      FROM live_sessions ls
      JOIN class_routine cr ON ls.routine_id = cr.id
      JOIN batches b ON ls.batch_id = b.id
      WHERE cr.instructor_name = ? AND ls.recording_url IS NOT NULL
      ORDER BY ls.session_date DESC
      LIMIT 20
    `;
    
    db.query(sql, [teacherName], (err, result) => {
      if (err) {
        console.error("Error fetching recordings:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result || []);
    });
  });
};

// Start live session
const startLiveSession = (req, res) => {
  const { classId } = req.params;
  const { teacherId, title, platform, meeting_link } = req.body;
  
  console.log("Starting live session for class:", classId);
  
  const getClassSql = `
    SELECT cr.*, b.id as batch_id, c.id as course_id
    FROM class_routine cr
    JOIN batches b ON cr.batch_id = b.id
    JOIN courses c ON cr.course_code = c.course_code
    WHERE cr.id = ?
  `;
  
  db.query(getClassSql, [classId], (err, classResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (classResult.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    const classData = classResult[0];
    const sessionDate = new Date().toISOString().split('T')[0];
    
    // Check if live session already exists
    const checkSql = "SELECT id FROM live_sessions WHERE routine_id = ? AND session_date = CURDATE()";
    
    db.query(checkSql, [classId], (err, existing) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (existing.length > 0) {
        const updateSql = `
          UPDATE live_sessions 
          SET status = 'live', meeting_link = ?, platform = ?, start_time = NOW(), title = ?
          WHERE id = ?
        `;
        
        db.query(updateSql, [meeting_link, platform, title, existing[0].id], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
          }
          res.json({ success: true, message: "Live session started", sessionId: existing[0].id });
        });
      } else {
        const insertSql = `
          INSERT INTO live_sessions (routine_id, batch_id, course_id, title, instructor_name, platform, meeting_link, session_date, start_time, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'live')
        `;
        
        db.query(insertSql, [classId, classData.batch_id, classData.course_id, title, classData.instructor_name, platform, meeting_link, sessionDate], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
          }
          res.json({ success: true, message: "Live session started", sessionId: result.insertId });
        });
      }
    });
  });
};

// End live session
const endLiveSession = (req, res) => {
  const { sessionId } = req.params;
  
  console.log("Ending live session:", sessionId);
  
  const sql = "UPDATE live_sessions SET status = 'ended', end_time = NOW() WHERE id = ?";
  
  db.query(sql, [sessionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: "Live session ended" });
  });
};

// Add recording
const addRecording = (req, res) => {
  const { sessionId } = req.params;
  const { recording_url } = req.body;
  
  const sql = "UPDATE live_sessions SET recording_url = ?, status = 'recorded' WHERE id = ?";
  
  db.query(sql, [recording_url, sessionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: "Recording added successfully" });
  });
};

// Update meeting link
const updateMeetingLink = (req, res) => {
  const { classId } = req.params;
  const { meeting_link } = req.body;
  
  const sql = "UPDATE class_routine SET meeting_link = ? WHERE id = ?";
  
  db.query(sql, [meeting_link, classId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: "Meeting link updated successfully" });
  });
};

module.exports = {
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
};