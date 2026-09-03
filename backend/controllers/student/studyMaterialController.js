const db = require("../../config/db");
const path = require("path");
const fs = require("fs");

// GET all study materials (approved ones for students)
const getStudyMaterials = (req, res) => {
  const studentId = req.query.student_id || 'STU001';
  
  const sql = `
    SELECT 
      sm.*,
      CASE WHEN saved.material_id IS NOT NULL THEN TRUE ELSE FALSE END as is_saved
    FROM study_materials sm
    LEFT JOIN saved_materials saved ON sm.id = saved.material_id AND saved.student_id = ?
    WHERE sm.status = 'approved'
    ORDER BY sm.created_at DESC
  `;
  
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching study materials:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET materials by course
const getMaterialsByCourse = (req, res) => {
  const { courseCode } = req.params;
  const studentId = req.query.student_id || 'STU001';
  
  const sql = `
    SELECT 
      sm.*,
      CASE WHEN saved.material_id IS NOT NULL THEN TRUE ELSE FALSE END as is_saved
    FROM study_materials sm
    LEFT JOIN saved_materials saved ON sm.id = saved.material_id AND saved.student_id = ?
    WHERE sm.course_code = ? AND sm.status = 'approved'
    ORDER BY sm.created_at DESC
  `;
  
  db.query(sql, [studentId, courseCode], (err, result) => {
    if (err) {
      console.error("Error fetching materials by course:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET my uploaded materials (for student)
const getMyUploads = (req, res) => {
  const studentId = req.query.student_id || 'STU001';
  
  const sql = `
    SELECT * FROM study_materials 
    WHERE student_id = ? OR uploaded_by = ?
    ORDER BY created_at DESC
  `;
  
  db.query(sql, [studentId, studentId], (err, result) => {
    if (err) {
      console.error("Error fetching my uploads:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// GET saved materials
const getSavedMaterials = (req, res) => {
  const studentId = req.query.student_id || 'STU001';
  
  const sql = `
    SELECT sm.*, saved.saved_at
    FROM study_materials sm
    INNER JOIN saved_materials saved ON sm.id = saved.material_id
    WHERE saved.student_id = ?
    ORDER BY saved.saved_at DESC
  `;
  
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error("Error fetching saved materials:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
};

// POST upload study material
const uploadMaterial = (req, res) => {
  const { title, description, course_code, course_name, material_type, uploaded_by } = req.body;
  const uploadedFile = req.file;
  const studentId = req.body.student_id || 'STU001';

  if (!title || !course_code || !course_name) {
    return res.status(400).json({ error: "Title and course are required" });
  }

  if (!uploadedFile) {
    return res.status(400).json({ error: "Please upload a file" });
  }

  let fileUrl = `/uploads/study_materials/${uploadedFile.filename}`;
  let fileName = uploadedFile.originalname;
  let fileSize = uploadedFile.size;

  const sql = `
    INSERT INTO study_materials 
    (title, description, course_code, course_name, material_type, file_name, file_url, file_size, uploaded_by, student_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  
  db.query(sql, [title, description, course_code, course_name, material_type, fileName, fileUrl, fileSize, uploaded_by || 'Student', studentId], (err, result) => {
    if (err) {
      console.error("Error uploading material:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json({ 
      success: true, 
      message: "Material uploaded successfully. Awaiting approval.", 
      material_id: result.insertId 
    });
  });
};

// POST save/un-save material
const toggleSaveMaterial = (req, res) => {
  const { materialId } = req.params;
  const studentId = req.body.student_id || 'STU001';
  
  // Check if already saved
  const checkSql = "SELECT id FROM saved_materials WHERE material_id = ? AND student_id = ?";
  
  db.query(checkSql, [materialId, studentId], (err, result) => {
    if (err) {
      console.error("Error checking save status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length > 0) {
      // Unsave
      const deleteSql = "DELETE FROM saved_materials WHERE material_id = ? AND student_id = ?";
      db.query(deleteSql, [materialId, studentId], (err) => {
        if (err) {
          console.error("Error unsaving material:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, saved: false, message: "Removed from saved" });
      });
    } else {
      // Save
      const insertSql = "INSERT INTO saved_materials (material_id, student_id) VALUES (?, ?)";
      db.query(insertSql, [materialId, studentId], (err) => {
        if (err) {
          console.error("Error saving material:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, saved: true, message: "Added to saved" });
      });
    }
  });
};

// POST increment download count
const incrementDownloadCount = (req, res) => {
  const { materialId } = req.params;
  
  const sql = "UPDATE study_materials SET download_count = download_count + 1 WHERE id = ?";
  
  db.query(sql, [materialId], (err, result) => {
    if (err) {
      console.error("Error updating download count:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
};

// GET statistics
const getStatistics = (req, res) => {
  const studentId = req.query.student_id || 'STU001';
  
  const totalSql = "SELECT COUNT(*) as total FROM study_materials WHERE status = 'approved'";
  const approvedSql = "SELECT COUNT(*) as approved FROM study_materials WHERE status = 'approved'";
  const pendingSql = "SELECT COUNT(*) as pending FROM study_materials WHERE status = 'pending'";
  const downloadsSql = "SELECT SUM(download_count) as total_downloads FROM study_materials";
  
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(totalSql, (err, result) => resolve(result[0].total || 0));
    }),
    new Promise((resolve, reject) => {
      db.query(approvedSql, (err, result) => resolve(result[0].approved || 0));
    }),
    new Promise((resolve, reject) => {
      db.query(pendingSql, (err, result) => resolve(result[0].pending || 0));
    }),
    new Promise((resolve, reject) => {
      db.query(downloadsSql, (err, result) => resolve(result[0].total_downloads || 0));
    })
  ]).then(([total, approved, pending, totalDownloads]) => {
    res.json({ total, approved, pending, totalDownloads });
  });
};

module.exports = { 
  getStudyMaterials, 
  getMaterialsByCourse,
  getMyUploads,
  getSavedMaterials,
  uploadMaterial, 
  toggleSaveMaterial,
  incrementDownloadCount,
  getStatistics
};