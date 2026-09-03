const db = require("../../config/db");
const path = require("path");
const fs = require("fs");

// Get all study materials (for teacher view)
const getTeacherMaterials = (req, res) => {
  const { teacherId } = req.params;
  
  const sql = `
    SELECT sm.*, u.name as uploaded_by_name
    FROM study_materials sm
    LEFT JOIN users u ON sm.uploaded_by = u.user_id
    WHERE sm.teacher_id = ?
    ORDER BY sm.created_at DESC
  `;
  
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error("Error fetching materials:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result || []);
  });
};

// Get teacher's courses (for dropdown)
const getTeacherCourses = (req, res) => {
  const { teacherId } = req.params;
  
  const sql = `SELECT course_code, course_name FROM teacher_courses WHERE teacher_id = ?`;
  
  db.query(sql, [teacherId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    
    if (results && results.length > 0) {
      res.json(results);
    } else {
      // Return default courses if none found
      const defaultCourses = [
        { course_code: "CSE-101", course_name: "Programming Fundamentals" },
        { course_code: "CSE-102", course_name: "Object Oriented Programming" },
        { course_code: "CSE-201", course_name: "Data Structures" },
        { course_code: "CSE-202", course_name: "Algorithms" },
        { course_code: "CSE-203", course_name: "Database Systems" }
      ];
      res.json(defaultCourses);
    }
  });
};

// Upload study material (teacher)
const uploadMaterial = (req, res) => {
  const { teacherId } = req.params;
  const { title, description, course_code, course_name, material_type } = req.body;
  const uploadedFile = req.file;
  
  if (!title || !course_code) {
    return res.status(400).json({ error: "Title and course are required" });
  }
  
  if (!uploadedFile) {
    return res.status(400).json({ error: "Please upload a file" });
  }
  
  const getTeacherSql = "SELECT name FROM users WHERE user_id = ?";
  
  db.query(getTeacherSql, [teacherId], (err, teacherResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const teacherName = teacherResult[0]?.name || "Teacher";
    
    let fileUrl = `/uploads/study_materials/${uploadedFile.filename}`;
    let fileName = uploadedFile.originalname;
    let fileSize = uploadedFile.size;
    
    const insertSql = `
      INSERT INTO study_materials 
      (title, description, course_code, course_name, material_type, file_name, file_url, file_size, uploaded_by, teacher_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `;
    
    db.query(insertSql, [title, description, course_code, course_name, material_type, fileName, fileUrl, fileSize, teacherName, teacherId], (err, result) => {
      if (err) {
        console.error("Error uploading material:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Material uploaded successfully", material_id: result.insertId });
    });
  });
};

// Delete study material
const deleteMaterial = (req, res) => {
  const { materialId } = req.params;
  const { teacherId } = req.body;
  
  const checkSql = "SELECT id, file_url FROM study_materials WHERE id = ? AND teacher_id = ?";
  
  db.query(checkSql, [materialId, teacherId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(403).json({ error: "You can only delete your own materials" });
    }
    
    if (result[0].file_url) {
      const filePath = path.join(__dirname, '../../', result[0].file_url);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    const deleteSql = "DELETE FROM study_materials WHERE id = ?";
    
    db.query(deleteSql, [materialId], (err, result) => {
      if (err) {
        console.error("Error deleting material:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ success: true, message: "Material deleted successfully" });
    });
  });
};

// Get statistics for teacher
const getStatistics = (req, res) => {
  const { teacherId } = req.params;
  
  const totalSql = "SELECT COUNT(*) as total FROM study_materials WHERE teacher_id = ?";
  
  db.query(totalSql, [teacherId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ 
      total: result[0]?.total || 0, 
      approved: result[0]?.total || 0, 
      totalDownloads: 0 
    });
  });
};

module.exports = {
  getTeacherMaterials,
  getTeacherCourses,
  uploadMaterial,
  deleteMaterial,
  getStatistics
};