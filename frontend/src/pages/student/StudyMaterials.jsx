import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyMaterials.css";

function StudyMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, totalDownloads: 0 });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMyUploads, setShowMyUploads] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [myUploads, setMyUploads] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    course_code: '',
    course_name: '',
    material_type: 'lecture_note'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isCR, setIsCR] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchMaterials();
    checkUserStatus();
    createFloatingShapes();
  }, []);

  const checkUserStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const crFromUrl = urlParams.get('cr') === 'true';
    const crFromSession = sessionStorage.getItem('isCR') === 'true';
    setIsCR(crFromUrl || crFromSession);
  };

  const fetchStats = () => {
    fetch("http://localhost:5000/api/student/study-materials/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  };

  const fetchMaterials = () => {
    fetch("http://localhost:5000/api/student/study-materials?student_id=STU001")
      .then(res => res.json())
      .then(data => {
        setMaterials(data);
        setFilteredMaterials(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchMyUploads = () => {
    fetch("http://localhost:5000/api/student/study-materials/my-uploads?student_id=STU001")
      .then(res => res.json())
      .then(data => setMyUploads(data));
  };

  const fetchSavedMaterials = () => {
    fetch("http://localhost:5000/api/student/study-materials/saved?student_id=STU001")
      .then(res => res.json())
      .then(data => setSavedMaterials(data));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterMaterials(term, activeFilter);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    filterMaterials(searchTerm, filter);
  };

  const filterMaterials = (term, filter) => {
    let filtered = [...materials];
    
    if (term) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(term.toLowerCase()) ||
        m.course_name.toLowerCase().includes(term.toLowerCase()) ||
        m.description?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(m => m.material_type === filter);
    }
    
    setFilteredMaterials(filtered);
  };

  const handleDownload = async (material) => {
    // Increment download count
    await fetch(`http://localhost:5000/api/student/study-materials/${material.id}/download`, {
      method: 'POST'
    });
    
    // Open download link
    window.open(`http://localhost:5000${material.file_url}`);
    
    // Update stats
    fetchStats();
  };

  const handleSaveToggle = async (materialId, isCurrentlySaved) => {
    const response = await fetch(`http://localhost:5000/api/student/study-materials/${materialId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: 'STU001' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update materials list
      const updateMaterialList = (list) => {
        return list.map(m => 
          m.id === materialId ? { ...m, is_saved: data.saved } : m
        );
      };
      
      setMaterials(updateMaterialList(materials));
      setFilteredMaterials(updateMaterialList(filteredMaterials));
      
      if (showSaved) {
        fetchSavedMaterials();
      }
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('course_code', uploadForm.course_code);
    formData.append('course_name', uploadForm.course_name);
    formData.append('material_type', uploadForm.material_type);
    formData.append('uploaded_by', 'Student User');
    formData.append('student_id', 'STU001');
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch("http://localhost:5000/api/student/study-materials/upload", {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Material uploaded successfully! Awaiting approval.");
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          course_code: '',
          course_name: '',
          material_type: 'lecture_note'
        });
        setSelectedFile(null);
        fetchMaterials();
        fetchStats();
      } else {
        alert(data.error || "Error uploading material");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading material");
    } finally {
      setUploading(false);
    }
  };

  const showMyUploadsView = () => {
    fetchMyUploads();
    setShowMyUploads(true);
    setShowSaved(false);
    setShowUploadModal(false);
  };

  const showSavedView = () => {
    fetchSavedMaterials();
    setShowSaved(true);
    setShowMyUploads(false);
    setShowUploadModal(false);
  };

  const showAllMaterials = () => {
    setShowMyUploads(false);
    setShowSaved(false);
    setShowUploadModal(false);
  };

  const createFloatingShapes = () => {
    const container = document.getElementById('floatingShapes');
    if (!container) return;
    
    container.innerHTML = '';
    const shapes = ['circle', 'square'];
    for (let i = 0; i < 12; i++) {
      const shape = document.createElement('div');
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      shape.className = `shape shape-${shapeType}`;
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
    sessionStorage.clear();
    window.location.href = '/login.html';
  };

  // Group materials by course
  const materialsByCourse = filteredMaterials.reduce((acc, material) => {
    const key = material.course_code;
    if (!acc[key]) {
      acc[key] = {
        course_code: material.course_code,
        course_name: material.course_name,
        materials: []
      };
    }
    acc[key].materials.push(material);
    return acc;
  }, {});

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

  const displayMaterials = showMyUploads ? myUploads : (showSaved ? savedMaterials : filteredMaterials);
  const displayByCourse = !showMyUploads && !showSaved;

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">🎓</div>
            <div className="logo-text">SWE<span>Hub</span></div>
          </div>
          <div className="user-section">
            {isCR && (
              <div className="cr-badge">
                <span>👑</span>
                <span>Class Representative</span>
              </div>
            )}
            <div className="user-avatar">👤</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="study-materials">
        <div className="materials-header">
          <div className="header-top">
            <button className="back-dashboard" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => setShowUploadModal(true)}>
                📤 Upload Material
              </button>
              <button className="action-btn" onClick={showMyUploadsView}>
                📝 My Uploads
              </button>
              <button className="action-btn" onClick={showSavedView}>
                ⭐ Saved
              </button>
            </div>
          </div>
          <h1>Study Materials & Resources</h1>
          <p>Access all your course materials, lecture notes, and reference books</p>
        </div>

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
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="stat-card-mini">
            <div className="stat-number">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>

        {!showMyUploads && !showSaved && (
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search materials by title, course, or keyword..."
              className="search-input-large"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="filter-buttons">
              <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilter('all')}>All</button>
              <button className={`filter-btn ${activeFilter === 'lecture_note' ? 'active' : ''}`} onClick={() => handleFilter('lecture_note')}>Lecture Notes</button>
              <button className={`filter-btn ${activeFilter === 'practice_problem' ? 'active' : ''}`} onClick={() => handleFilter('practice_problem')}>Practice Problems</button>
              <button className={`filter-btn ${activeFilter === 'reference_book' ? 'active' : ''}`} onClick={() => handleFilter('reference_book')}>Reference Books</button>
              <button className={`filter-btn ${activeFilter === 'slides' ? 'active' : ''}`} onClick={() => handleFilter('slides')}>Slides</button>
            </div>
          </div>
        )}

        {(showMyUploads || showSaved) && (
          <div className="back-link">
            <button onClick={showAllMaterials} className="back-link-btn">
              ← Back to All Materials
            </button>
            <h2>{showMyUploads ? 'My Uploads' : 'Saved Materials'}</h2>
          </div>
        )}

        <div className="materials-content">
          {displayByCourse ? (
            Object.values(materialsByCourse).map((course) => (
              <div key={course.course_code} className="course-group">
                <div className="course-header" onClick={() => setExpandedCourse(expandedCourse === course.course_code ? null : course.course_code)}>
                  <span className="course-icon">📊</span>
                  <div>
                    <div className="course-code">{course.course_code}</div>
                    <div className="course-name-full">{course.course_name}</div>
                  </div>
                  <span className="material-count">📚 {course.materials.length} materials</span>
                  <span className="expand-icon">{expandedCourse === course.course_code ? '▲' : '▼'}</span>
                </div>
                {expandedCourse === course.course_code && (
                  <div className="materials-list">
                    {course.materials.map((material) => (
                      <div key={material.id} className="material-item">
                        <div className="material-icon">{getMaterialIcon(material.material_type)}</div>
                        <div className="material-info">
                          <div className="material-title">{material.title}</div>
                          <div className="material-description">{material.description}</div>
                          <div className="material-meta">
                            <span className="material-type">{material.material_type?.replace('_', ' ')}</span>
                            <span className="material-size">{material.file_size}</span>
                            <span className="material-downloads">⬇️ {material.download_count} downloads</span>
                          </div>
                        </div>
                        <div className="material-actions">
                          <button className="download-material" onClick={() => handleDownload(material)}>📥 Download</button>
                          <button className={`save-material ${material.is_saved ? 'saved' : ''}`} onClick={() => handleSaveToggle(material.id, material.is_saved)}>
                            {material.is_saved ? '⭐ Saved' : '☆ Save'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="materials-list-simple">
              {displayMaterials.map((material) => (
                <div key={material.id} className="material-item">
                  <div className="material-icon">{getMaterialIcon(material.material_type)}</div>
                  <div className="material-info">
                    <div className="material-title">{material.title}</div>
                    <div className="material-course">{material.course_code} - {material.course_name}</div>
                    <div className="material-description">{material.description}</div>
                    <div className="material-meta">
                      <span className="material-type">{material.material_type?.replace('_', ' ')}</span>
                      <span className="material-size">{material.file_size}</span>
                      <span className="material-downloads">⬇️ {material.download_count} downloads</span>
                      {showMyUploads && (
                        <span className={`material-status status-${material.status}`}>
                          {material.status === 'approved' ? '✅ Approved' : material.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="material-actions">
                    <button className="download-material" onClick={() => handleDownload(material)}>📥 Download</button>
                    {!showMyUploads && (
                      <button className={`save-material ${material.is_saved ? 'saved' : ''}`} onClick={() => handleSaveToggle(material.id, material.is_saved)}>
                        {material.is_saved ? '⭐ Saved' : '☆ Save'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {displayMaterials.length === 0 && (
                <div className="empty-materials">
                  <div className="empty-icon">📭</div>
                  <h3>No materials found</h3>
                  <p>Upload your first study material or check back later</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Study Material</h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input type="text" required value={uploadForm.course_code} onChange={(e) => setUploadForm({...uploadForm, course_code: e.target.value})} placeholder="CSE 201" />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input type="text" required value={uploadForm.course_name} onChange={(e) => setUploadForm({...uploadForm, course_name: e.target.value})} placeholder="Data Structures" />
                </div>
              </div>
              <div className="form-group">
                <label>Material Type</label>
                <select value={uploadForm.material_type} onChange={(e) => setUploadForm({...uploadForm, material_type: e.target.value})}>
                  <option value="lecture_note">Lecture Note</option>
                  <option value="practice_problem">Practice Problem</option>
                  <option value="reference_book">Reference Book</option>
                  <option value="slides">Slides</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="form-group">
                <label>File *</label>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.txt,.zip" required />
                <small>Max 50MB • PDF, DOCX, PPTX, TXT, ZIP</small>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default StudyMaterials;