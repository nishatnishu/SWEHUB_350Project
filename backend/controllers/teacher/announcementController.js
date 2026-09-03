const db = require("../../config/db");

// Get all announcements for teacher
const getTeacherAnnouncements = (req, res) => {
  const { teacherId } = req.params;
  
  const sql = `
    SELECT a.*, 
           (SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = a.id) as comments_count
    FROM announcements a
    WHERE a.teacher_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error("Error fetching announcements:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};

// Create new announcement
const createAnnouncement = (req, res) => {
  const { teacherId } = req.params;
  const { title, content, course_code, course_name, batch_id } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const teacherName = teacherResult[0]?.name || "Teacher";
    
    const insertSql = `
      INSERT INTO announcements (teacher_id, teacher_name, title, content, course_code, course_name, batch_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
    `;
    
    db.query(insertSql, [teacherId, teacherName, title, content, course_code || null, course_name || null, batch_id || null], (err, result) => {
      if (err) {
        console.error("Error creating announcement:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Announcement posted successfully", announcementId: result.insertId });
    });
  });
};

// Delete announcement
const deleteAnnouncement = (req, res) => {
  const { announcementId } = req.params;
  
  const sql = "DELETE FROM announcements WHERE id = ?";
  
  db.query(sql, [announcementId], (err, result) => {
    if (err) {
      console.error("Error deleting announcement:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true, message: "Announcement deleted successfully" });
  });
};

// Get comments for an announcement
const getComments = (req, res) => {
  const { announcementId } = req.params;
  
  const sql = "SELECT * FROM announcement_comments WHERE announcement_id = ? ORDER BY created_at ASC";
  
  db.query(sql, [announcementId], (err, result) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};

// Add comment to announcement
const addComment = (req, res) => {
  const { announcementId } = req.params;
  const { student_id, student_name, comment } = req.body;
  
  if (!comment || !student_id) {
    return res.status(400).json({ error: "Comment and student ID are required" });
  }
  
  const insertSql = `
    INSERT INTO announcement_comments (announcement_id, student_id, student_name, comment)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(insertSql, [announcementId, student_id, student_name || 'Student', comment], (err, result) => {
    if (err) {
      console.error("Error adding comment:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const updateCountSql = "UPDATE announcements SET comments_count = comments_count + 1 WHERE id = ?";
    db.query(updateCountSql, [announcementId]);
    
    res.json({ success: true, message: "Comment added successfully", commentId: result.insertId });
  });
};
// Get comments for an announcement (for teacher view)
const getCommentsForTeacher = (req, res) => {
  const { announcementId } = req.params;
  
  const sql = `
    SELECT c.*, u.name as student_name, u.user_id
    FROM announcement_comments c
    JOIN users u ON c.student_id = u.user_id
    WHERE c.announcement_id = ?
    ORDER BY c.created_at ASC
  `;
  
  db.query(sql, [announcementId], (err, result) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};
// Like/Unlike announcement
const toggleLike = (req, res) => {
  const { announcementId } = req.params;
  const { user_id, user_role } = req.body;
  
  const checkSql = "SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_id = ?";
  
  db.query(checkSql, [announcementId, user_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0) {
      const deleteSql = "DELETE FROM announcement_likes WHERE announcement_id = ? AND user_id = ?";
      db.query(deleteSql, [announcementId, user_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        
        const updateCountSql = "UPDATE announcements SET likes_count = likes_count - 1 WHERE id = ?";
        db.query(updateCountSql, [announcementId]);
        
        res.json({ success: true, liked: false });
      });
    } else {
      const insertSql = "INSERT INTO announcement_likes (announcement_id, user_id, user_role) VALUES (?, ?, ?)";
      db.query(insertSql, [announcementId, user_id, user_role], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        
        const updateCountSql = "UPDATE announcements SET likes_count = likes_count + 1 WHERE id = ?";
        db.query(updateCountSql, [announcementId]);
        
        res.json({ success: true, liked: true });
      });
    }
  });
};

// Get user's batch ID
const getUserBatch = (req, res) => {
  const { studentId } = req.params;
  
  const sql = "SELECT batch_id FROM users WHERE user_id = ?";
  
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching user batch:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ batch_id: result[0]?.batch_id || null });
  });
};

// Get all announcements for students
const getStudentAnnouncements = (req, res) => {
  const { studentId } = req.params;
  const { batchId } = req.query;
  
  let sql = `
    SELECT 
      a.*,
      (SELECT COUNT(*) FROM announcement_comments WHERE announcement_id = a.id) as comments_count,
      (SELECT COUNT(*) FROM announcement_likes WHERE announcement_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM announcement_likes WHERE announcement_id = a.id AND user_id = ?) as user_liked
    FROM announcements a
    WHERE a.status = 'published'
  `;
  
  const params = [studentId];
  
  if (batchId) {
    sql += ` AND (a.batch_id IS NULL OR a.batch_id = ?)`;
    params.push(batchId);
  }
  
  sql += ` ORDER BY a.created_at DESC`;
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error fetching announcements:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};

module.exports = {
  getTeacherAnnouncements,
  getStudentAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getComments,  // existing for students
  getCommentsForTeacher, // new for teacher
  addComment,
  toggleLike,
  getUserBatch
};