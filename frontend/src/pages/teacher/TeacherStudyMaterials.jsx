import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherStudyMaterials.css";

function TeacherStudyMaterials() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, totalDownloads: 0 });
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_code: "",
    course_name: "",
    material_type: "lecture_note"
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Stored user:", storedUser);
    setUser(storedUser);
    
    if (storedUser.userId) {
      Promise.all([
        fetchMaterials(storedUser.userId),
        fetchCourses(storedUser.userId),
        fetchStats(storedUser.userId)
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setError("User not found. Please login again.");
      setLoading(false);
    }
    createFloatingShapes();
  }, []);

  const fetchMaterials = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/materials/${teacherId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const fetchCourses = async (teacherId) => {
    try {
      console.log("Fetching courses for teacher:", teacherId);
      const response = await fetch(`http://localhost:5000/api/teacher/materials/courses/${teacherId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Courses API response:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      } else {
        // Fallback courses if API returns empty
        setCourses([
          { course_code: "CSE-101", course_name: "Programming Fundamentals" },
          { course_code: "CSE-201", course_name: "Data Structures" },
          { course_code: "CSE-301", course_name: "Database Systems" }
        ]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallback courses on error
      setCourses([
        { course_code: "CSE-101", course_name: "Programming Fundamentals" },
        { course_code: "CSE-201", course_name: "Data Structures" },
        { course_code: "CSE-301", course_name: "Database Systems" }
      ]);
    }
  };

  const fetchStats = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/materials/stats/${teacherId}`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({ total: 0, approved: 0, totalDownloads: 0 });
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCourseChange = (e) => {
    const selectedCourse = courses.find(c => c.course_code === e.target.value);
    setFormData({
      ...formData,
      course_code: e.target.value,
      course_name: selectedCourse?.course_name || ""
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    
    setUploading(true);
    
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('course_code', formData.course_code);
    formDataObj.append('course_name', formData.course_name);
    formDataObj.append('material_type', formData.material_type);
    formDataObj.append('file', selectedFile);
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/materials/upload/${user.userId}`, {
        method: "POST",
        body: formDataObj
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Material uploaded successfully!");
        setShowUploadModal(false);
        setFormData({
          title: "",
          description: "",
          course_code: "",
          course_name: "",
          material_type: "lecture_note"
        });
        setSelectedFile(null);
        await fetchMaterials(user.userId);
        await fetchStats(user.userId);
      } else {
        alert(data.error || "Error uploading material");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading material");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/materials/delete/${materialId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: user.userId })
      });
      
      if (response.ok) {
        alert("✅ Material deleted!");
        await fetchMaterials(user.userId);
        await fetchStats(user.userId);
      } else {
        const data = await response.json();
        alert(data.error || "Error deleting material");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting material");
    }
  };

  const getMaterialIcon = (type) => {
    switch(type) {
      case 'lecture_note': return '📚';
      case 'practice_problem': return '✏️';
      case 'reference_book': return '📖';
      case 'video': return '🎥';
      case 'slides': return '📊';
      default: return '📄';
    }
  };

  const createFloatingShapes = () => {
    const container = document.getElementById('floatingShapes');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const shape = document.createElement('div');
      shape.className = `shape shape-${Math.random() > 0.5 ? 'circle' : 'square'}`;
      const size = Math.random() * 60 + 30;
      shape.style.width = size + 'px';
      shape.style.height = size + 'px';
      shape.style.left = Math.random() * 100 + '%';
      shape.style.animationDuration = (Math.random() * 25 + 30) + 's';
      shape.style.animationDelay = Math.random() * 15 + 's';
      container.appendChild(shape);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Show loading indicator
  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading study materials...</p>
        </div>
      </>
    );
  }

  // Show error if any
  if (error) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
          <button onClick={() => navigate('/teacher-dashboard')}>Back to Dashboard</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <header className="teacher-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/teacher-dashboard')} style={{ cursor: 'pointer' }}>
            📚 SWEHub - Teacher Panel
          </div>
          <div className="user-section">
            <span>Welcome, {user?.name || "Teacher"}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="teacher-materials-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/teacher-dashboard')}>← Back to Dashboard</button>
          <h1>Study Materials Management</h1>
          <p>Upload and manage lecture notes, resources for students</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card-mini">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Materials</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-number">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="upload-section">
          <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
            + Upload New Material
          </button>
        </div>

        {/* Materials List */}
        <div className="materials-list">
          <h2>Your Uploaded Materials</h2>
          {materials.length === 0 ? (
            <div className="no-materials">
              <div className="no-data-icon">📚</div>
              <p>No materials uploaded yet. Click "Upload New Material" to get started.</p>
            </div>
          ) : (
            <div className="materials-grid">
              {materials.map(material => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">{getMaterialIcon(material.material_type)}</div>
                  <div className="material-info">
                    <h3 className="material-title">{material.title}</h3>
                    <p className="material-description">{material.description?.substring(0, 100)}...</p>
                    <div className="material-meta">
                      <span className="course-badge">📖 {material.course_code} - {material.course_name}</span>
                      <span className="type-badge">{material.material_type?.replace('_', ' ')}</span>
                      <span className="download-count">⬇️ {material.download_count || 0} downloads</span>
                      <span className="file-size">📄 {material.file_size}</span>
                    </div>
                    <div className="material-actions">
                      <a href={`http://localhost:5000${material.file_url}`} target="_blank" rel="noopener noreferrer" className="download-material-btn">
                        📥 Download
                      </a>
                      <button className="delete-material-btn" onClick={() => handleDelete(material.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Study Material</h2>
              <button className="close-modal" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Data Structures Lecture 1"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the material..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course *</label>
                  <select required value={formData.course_code} onChange={handleCourseChange}>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_code} value={course.course_code}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Material Type</label>
                  <select value={formData.material_type} onChange={(e) => setFormData({...formData, material_type: e.target.value})}>
                    <option value="lecture_note">Lecture Note</option>
                    <option value="practice_problem">Practice Problem</option>
                    <option value="reference_book">Reference Book</option>
                    <option value="slides">Slides</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>File *</label>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.txt,.zip,.jpg,.png" required />
                <small>Max 50MB • PDF, DOCX, PPTX, TXT, ZIP, Images</small>
              </div>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherStudyMaterials;

