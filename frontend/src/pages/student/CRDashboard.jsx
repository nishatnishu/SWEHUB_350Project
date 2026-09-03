import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CRDashboard.css";

function CRDashboard() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [crId] = useState("CR001"); // This would come from login session
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [courses, setCourses] = useState([]);
  const [changeLogs, setChangeLogs] = useState([]);
  
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    instructor_name: '',
    day_of_week: 'Sunday',
    start_time: '08:30:00',
    end_time: '10:00:00',
    room: '',
    platform: 'Physical',
    meeting_link: ''
  });

  useEffect(() => {
    fetchCRDashboard();
    fetchCourses();
    fetchChangeLogs();
    createFloatingShapes();
  }, []);

  const fetchCRDashboard = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/dashboard/${batchId}/${crId}`);
      const data = await response.json();
      setDashboard(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChangeLogs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/logs/${batchId}`);
      const data = await response.json();
      setChangeLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/${batchId}/${crId}/add-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Class added successfully!");
        setShowAddModal(false);
        setFormData({
          course_code: '',
          course_name: '',
          instructor_name: '',
          day_of_week: 'Sunday',
          start_time: '08:30:00',
          end_time: '10:00:00',
          room: '',
          platform: 'Physical',
          meeting_link: ''
        });
        fetchCRDashboard();
        fetchChangeLogs();
      } else {
        alert(data.error || "Error adding class");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding class");
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/${batchId}/${crId}/edit-class/${selectedClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Class updated successfully!");
        setShowEditModal(false);
        setSelectedClass(null);
        fetchCRDashboard();
        fetchChangeLogs();
      } else {
        alert(data.error || "Error updating class");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating class");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    
    const reason = prompt("Reason for deletion:");
    
    try {
      const response = await fetch(`http://localhost:5000/api/student/cr/${batchId}/${crId}/delete-class/${classId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || "No reason provided" })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Class deleted successfully!");
        fetchCRDashboard();
        fetchChangeLogs();
      } else {
        alert(data.error || "Error deleting class");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting class");
    }
  };

  const openEditModal = (classData) => {
    setSelectedClass(classData);
    setFormData({
      course_code: classData.course_code,
      course_name: classData.course_name,
      instructor_name: classData.instructor_name,
      day_of_week: classData.day_of_week,
      start_time: classData.start_time,
      end_time: classData.end_time,
      room: classData.room || '',
      platform: classData.platform || 'Physical',
      meeting_link: classData.meeting_link || ''
    });
    setShowEditModal(true);
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

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeSlots = ['08:30:00', '10:30:00', '12:30:00', '14:30:00', '16:30:00'];
  const timeLabels = ['8:30 - 10:00', '10:30 - 12:00', '12:30 - 14:00', '14:30 - 16:00', '16:30 - 18:00'];

  const getClassForSlot = (day, timeSlot) => {
    if (!dashboard?.routine) return null;
    return dashboard.routine.find(c => c.day_of_week === day && c.start_time === timeSlot);
  };

  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading CR Dashboard...</p>
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
            <div className="cr-badge">👑 Class Representative</div>
            <div className="user-avatar">👤</div>
            <button className="logout-btn" onClick={() => { sessionStorage.clear(); window.location.href = '/login.html'; }}>Logout</button>
          </div>
        </div>
      </header>

      <main className="cr-dashboard">
        <div className="dashboard-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1>CR Management Dashboard</h1>
          <p>Manage class routine for {dashboard?.batch?.batch_name}</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-cr">
          <button className="add-class-btn" onClick={() => setShowAddModal(true)}>
            + Add New Class
          </button>
          <button className="logs-btn" onClick={() => setShowLogsModal(true)}>
            📋 View Change Logs
          </button>
        </div>

        {/* Weekly Schedule Table */}
        <div className="schedule-table-container">
          <h2>Current Class Routine</h2>
          <div className="table-responsive">
            <table className="cr-schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  {days.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, idx) => (
                  <tr key={idx}>
                    <td className="time-slot">{timeLabels[idx]}</td>
                    {days.map(day => {
                      const classData = getClassForSlot(day, slot);
                      return (
                        <td key={day} className={classData ? 'has-class' : 'empty-cell'}>
                          {classData ? (
                            <div className="class-card-small">
                              <div className="class-code">{classData.course_code}</div>
                              <div className="class-name">{classData.course_name}</div>
                              <div className="instructor">{classData.instructor_name}</div>
                              <div className="room">{classData.room || classData.platform}</div>
                              <div className="class-actions">
                                <button className="edit-small" onClick={() => openEditModal(classData)}>✏️ Edit</button>
                                <button className="delete-small" onClick={() => handleDeleteClass(classData.id)}>🗑️ Delete</button>
                              </div>
                            </div>
                          ) : (
                            <span className="empty">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Class</h2>
            <form onSubmit={handleAddClass}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <select required value={formData.course_code} onChange={(e) => {
                    const selectedCourse = courses.find(c => c.course_code === e.target.value);
                    setFormData({
                      ...formData,
                      course_code: e.target.value,
                      course_name: selectedCourse?.course_name || ''
                    });
                  }}>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.course_code}>{course.course_code} - {course.course_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Course Name</label>
                  <input type="text" value={formData.course_name} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label>Instructor Name *</label>
                <input type="text" required value={formData.instructor_name} onChange={(e) => setFormData({...formData, instructor_name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Day *</label>
                  <select required value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}>
                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Room</label>
                  <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="e.g., Room 201, Lab 1" />
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                    <option>Physical</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Meeting Link (if online)</label>
                <input type="url" value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} placeholder="https://meet.google.com/..." />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Add Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Class</h2>
            <form onSubmit={handleEditClass}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input type="text" required value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Instructor Name *</label>
                <input type="text" required value={formData.instructor_name} onChange={(e) => setFormData({...formData, instructor_name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Day *</label>
                  <select required value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}>
                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Room</label>
                  <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                    <option>Physical</option>
                    <option>Online</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Meeting Link</label>
                <input type="url" value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Logs Modal */}
      {showLogsModal && (
        <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>Change Logs</h2>
            <div className="logs-list">
              {changeLogs.length > 0 ? (
                changeLogs.map(log => (
                  <div key={log.id} className="log-item">
                    <div className="log-action">{log.action_type.toUpperCase()}</div>
                    <div className="log-details">
                      <strong>{log.course_code} - {log.course_name}</strong>
                      <p>{log.change_details}</p>
                      <small>{new Date(log.created_at).toLocaleString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-logs">No changes made yet</p>
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowLogsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CRDashboard;