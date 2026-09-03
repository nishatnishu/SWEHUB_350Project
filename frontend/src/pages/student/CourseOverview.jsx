import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseOverview.css";

function CourseOverview() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isCR, setIsCR] = useState(false);

  useEffect(() => {
    fetchSemesters();
    checkCRStatus();
    createFloatingShapes();
  }, []);

  const checkCRStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const crFromUrl = urlParams.get('cr') === 'true';
    const crFromSession = sessionStorage.getItem('isCR') === 'true';
    setIsCR(crFromUrl || crFromSession);
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/semesters");
      const data = await response.json();
      setSemesters(data);
      if (data.length > 0) {
        setSelectedSemester(data[0]);
        await fetchCourses(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCourses = async (semesterId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/semesters/${semesterId}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/courses/${courseId}`);
      const data = await response.json();
      setSelectedCourse(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    fetchCourses(semester.id);
    setSelectedCourse(null);
  };

  const handleCourseClick = (course) => {
    fetchCourseDetails(course.id);
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

  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course overview...</p>
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

      <main className="course-overview">
        <div className="overview-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1>Course Overview</h1>
          <p>Browse all 8 semesters of the Software Engineering program</p>
        </div>

        {/* Semester Cards */}
        <div className="semesters-grid">
          {semesters.map((semester) => (
            <div 
              key={semester.id} 
              className={`semester-card ${selectedSemester?.id === semester.id ? 'active' : ''}`}
              onClick={() => handleSemesterClick(semester)}
            >
              <div className="semester-header">
                <span className="semester-code">{semester.semester_code}</span>
              </div>
              <h3 className="semester-name">{semester.semester_name}</h3>
              <div className="semester-stats">
                <div className="stat">
                  <span className="stat-value">{semester.course_count || 0}</span>
                  <span className="stat-label">Courses</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{semester.total_credits || 0}</span>
                  <span className="stat-label">Credits</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{semester.total_hours || 0}</span>
                  <span className="stat-label">Hours/Week</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Semester Details */}
        {selectedSemester && (
          <div className="semester-details">
            <div className="details-header">
              <div>
                <h2>{selectedSemester.semester_name}</h2>
                <p className="semester-description">{selectedSemester.description}</p>
              </div>
            </div>

            <div className="quick-stats">
              <div className="quick-stat">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">Courses</div>
              </div>
              <div className="quick-stat">
                <div className="stat-number">{selectedSemester.total_credits || 0}</div>
                <div className="stat-label">Total Credits</div>
              </div>
              <div className="quick-stat">
                <div className="stat-number">{selectedSemester.total_hours || 0}</div>
                <div className="stat-label">Weekly Hours</div>
              </div>
            </div>

            {/* Courses Table */}
            <div className="courses-table-container">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credit</th>
                    <th>Hours/Week</th>
                    <th>Type</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="course-code">{course.course_code}</td>
                      <td className="course-title">{course.course_name}</td>
                      <td>{course.credits}</td>
                      <td>{course.hours_per_week}</td>
                      <td>
                        <span className={`type-badge type-${course.course_type?.toLowerCase()}`}>
                          {course.course_type}
                        </span>
                      </td>
                      <td>
                        <div className="tags">
                          {course.tags?.split(',').map((tag, i) => (
                            <span key={i} className="tag">{tag.trim()}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => handleCourseClick(course)}>
                          📖 Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
            <div className="course-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedCourse.course_code} - {selectedCourse.course_name}</h2>
                <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
              </div>
              
              <div className="modal-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('syllabus')}
                >
                  Syllabus
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('materials')}
                >
                  Materials
                </button>
              </div>

              <div className="modal-content">
                {activeTab === 'details' && (
                  <div className="details-tab">
                    <div className="info-grid-modal">
                      <div className="info-item">
                        <label>Credits:</label>
                        <span>{selectedCourse.credits}</span>
                      </div>
                      <div className="info-item">
                        <label>Hours/Week:</label>
                        <span>{selectedCourse.hours_per_week}</span>
                      </div>
                      <div className="info-item">
                        <label>Course Type:</label>
                        <span>{selectedCourse.course_type}</span>
                      </div>
                      <div className="info-item">
                        <label>Semester:</label>
                        <span>{selectedCourse.semester_code}</span>
                      </div>
                      <div className="info-item full-width">
                        <label>Prerequisites:</label>
                        <span>{selectedCourse.prerequisites || 'None'}</span>
                      </div>
                      <div className="info-item full-width">
                        <label>Learning Outcomes:</label>
                        <p>{selectedCourse.learning_outcomes || 'To be announced'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'syllabus' && (
                  <div className="syllabus-tab">
                    <h4>Course Syllabus</h4>
                    <p>{selectedCourse.syllabus || 'Syllabus will be updated soon.'}</p>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="materials-tab">
                    <h4>Course Materials</h4>
                    <p><strong>Textbook:</strong> {selectedCourse.course_materials || 'To be announced'}</p>
                    <div className="resource-links">
                      <a href="#" className="resource-link">📕 Reference Book 1</a>
                      <a href="#" className="resource-link">📗 Reference Book 2</a>
                      <a href="#" className="resource-link">📘 Lecture Slides</a>
                      <a href="#" className="resource-link">📙 Practice Problems</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="syllabus-btn" onClick={() => setActiveTab('syllabus')}>
                  📖 View Syllabus
                </button>
                <button className="materials-btn" onClick={() => setActiveTab('materials')}>
                  📚 Download Materials
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default CourseOverview;