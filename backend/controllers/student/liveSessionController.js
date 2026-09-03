const db = require("../../config/db");

// GET available batches
const getBatches = (req, res) => {
  const sql = "SELECT id, batch_name, batch_year FROM batches WHERE is_active = TRUE ORDER BY batch_year DESC";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching batches:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET class routine by batch
const getRoutineByBatch = (req, res) => {
  const { batchId } = req.params;
  
  const sql = `
    SELECT 
      cr.id,
      cr.course_code,
      cr.course_name,
      cr.instructor_name,
      cr.day_of_week,
      TIME_FORMAT(cr.start_time, '%h:%i %p') as start_time,
      TIME_FORMAT(cr.end_time, '%h:%i %p') as end_time,
      cr.room,
      cr.platform,
      cr.meeting_link,
      cr.status
    FROM class_routine cr
    WHERE cr.batch_id = ?
    ORDER BY FIELD(cr.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'), cr.start_time
  `;
  
  db.query(sql, [batchId], (err, result) => {
    if (err) {
      console.error("Error fetching routine:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET weekly schedule (table view)
const getWeeklySchedule = (req, res) => {
  const { batchId } = req.params;
  
  const sql = `
    SELECT 
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
    WHERE cr.batch_id = ?
    ORDER BY FIELD(cr.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'), cr.start_time
  `;
  
  db.query(sql, [batchId], (err, result) => {
    if (err) {
      console.error("Error fetching weekly schedule:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    // Group by day
    const schedule = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: []
    };
    
    result.forEach(row => {
      const day = row.day_of_week;
      if (schedule[day]) {
        schedule[day].push(row);
      }
    });
    
    res.json(schedule);
  });
};

// GET today's sessions
const getTodaysSessions = (req, res) => {
  const { batchId } = req.params;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  console.log("Today is:", today); // Debug log
  
  const sql = `
    SELECT 
      cr.id,
      cr.course_code,
      cr.course_name,
      cr.instructor_name,
      TIME_FORMAT(cr.start_time, '%h:%i %p') as start_time,
      TIME_FORMAT(cr.end_time, '%h:%i %p') as end_time,
      cr.room,
      cr.platform,
      cr.meeting_link,
      TIME_FORMAT(cr.start_time, '%H:%i:%s') as start_time_raw,
      TIME_FORMAT(cr.end_time, '%H:%i:%s') as end_time_raw,
      CASE 
        WHEN TIME(NOW()) BETWEEN cr.start_time AND cr.end_time THEN 'ongoing'
        WHEN TIME(NOW()) > cr.end_time THEN 'completed'
        ELSE 'upcoming'
      END as status
    FROM class_routine cr
    WHERE cr.batch_id = ? AND cr.day_of_week = ?
    ORDER BY cr.start_time
  `;
  
  db.query(sql, [batchId, today], (err, result) => {
    if (err) {
      console.error("Error fetching today's sessions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Today's sessions found:", result.length); // Debug log
    res.json(result);
  });
};

// GET live sessions (ongoing)
const getLiveSessions = (req, res) => {
  const { batchId } = req.params;
  
  const sql = `
    SELECT 
      ls.*,
      cr.course_code,
      cr.course_name,
      TIME_FORMAT(ls.start_time, '%h:%i %p') as formatted_start,
      TIME_FORMAT(ls.end_time, '%h:%i %p') as formatted_end,
      TIMESTAMPDIFF(MINUTE, ls.start_time, NOW()) as elapsed_minutes
    FROM live_sessions ls
    JOIN class_routine cr ON ls.routine_id = cr.id
    WHERE ls.batch_id = ? AND ls.session_date = CURDATE() AND ls.status = 'live'
    LIMIT 1
  `;
  
  db.query(sql, [batchId], (err, result) => {
    if (err) {
      console.error("Error fetching live sessions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0] || null);
  });
};

// GET recent recordings
const getRecentRecordings = (req, res) => {
  const { batchId } = req.params;
  
  const sql = `
    SELECT 
      ls.id,
      ls.title,
      ls.instructor_name,
      ls.recording_url,
      ls.session_date,
      cr.course_code,
      cr.course_name,
      DATEDIFF(NOW(), ls.session_date) as days_ago
    FROM live_sessions ls
    JOIN class_routine cr ON ls.routine_id = cr.id
    WHERE ls.batch_id = ? AND ls.status IN ('recorded', 'completed') AND ls.recording_url IS NOT NULL
    ORDER BY ls.session_date DESC
    LIMIT 5
  `;
  
  db.query(sql, [batchId], (err, result) => {
    if (err) {
      console.error("Error fetching recordings:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// POST mark attendance
const markAttendance = (req, res) => {
  const { sessionId } = req.params;
  const { student_id, student_name } = req.body;
  
  // Check if already marked
  const checkSql = "SELECT id FROM attendance WHERE session_id = ? AND student_id = ?";
  
  db.query(checkSql, [sessionId, student_id], (err, result) => {
    if (err) {
      console.error("Error checking attendance:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0) {
      return res.status(400).json({ error: "Attendance already marked" });
    }
    
    const insertSql = `
      INSERT INTO attendance (session_id, student_id, student_name, status)
      VALUES (?, ?, ?, 'present')
    `;
    
    db.query(insertSql, [sessionId, student_id, student_name || 'Student'], (err, result) => {
      if (err) {
        console.error("Error marking attendance:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      // Update attendance count
      const updateSql = "UPDATE live_sessions SET attendance_count = attendance_count + 1 WHERE id = ?";
      db.query(updateSql, [sessionId]);
      
      res.json({ success: true, message: "Attendance marked successfully" });
    });
  });
};

// POST join session
const joinSession = (req, res) => {
  const { sessionId } = req.params;
  res.json({ success: true, message: "Joined session" });
};

// GET session info
const getSessionInfo = (req, res) => {
  const { sessionId } = req.params;
  
  const sql = `
    SELECT 
      ls.*,
      cr.course_code,
      cr.course_name,
      cr.instructor_name,
      TIME_FORMAT(ls.start_time, '%h:%i %p') as start_time,
      TIME_FORMAT(ls.end_time, '%h:%i %p') as end_time
    FROM live_sessions ls
    JOIN class_routine cr ON ls.routine_id = cr.id
    WHERE ls.id = ?
  `;
  
  db.query(sql, [sessionId], (err, result) => {
    if (err) {
      console.error("Error fetching session info:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0] || null);
  });
};

module.exports = {
  getBatches,
  getRoutineByBatch,
  getWeeklySchedule,
  getTodaysSessions,
  getLiveSessions,
  getRecentRecordings,
  markAttendance,
  joinSession,
  getSessionInfo
};