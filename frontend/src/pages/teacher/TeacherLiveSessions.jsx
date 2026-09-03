import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherLiveSessions.css";

function TeacherLiveSessions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [classes, setClasses] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [liveForm, setLiveForm] = useState({
    title: "",
    platform: "Google Meet",
    meeting_link: ""
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeSlots = ['08:30:00', '10:30:00', '12:30:00', '14:30:00', '16:30:00'];
  const timeSlotLabels = ['8:30 - 10:00', '10:30 - 12:00', '12:30 - 14:00', '14:30 - 16:00', '16:30 - 18:00'];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    if (storedUser.userId) {
      fetchAllData(storedUser.userId);
    }
    createFloatingShapes();
  }, []);

  const fetchAllData = async (teacherId) => {
    await Promise.all([
      fetchBatches(),
      fetchWeeklySchedule(teacherId),
      fetchTodaysClasses(teacherId),
      fetchLiveSessions(teacherId),
      fetchRecordings(teacherId)
    ]);
    setLoading(false);
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teacher/batches");
      const data = await response.json();
      setBatches(data);
      if (data.length > 0) {
        setSelectedBatch(data[0]);
        await fetchTeacherClasses(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherClasses = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/classes/${user?.userId}/${batchId}`);
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeeklySchedule = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/weekly-schedule/${teacherId}`);
      const data = await response.json();
      setWeeklySchedule(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodaysClasses = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/todays-classes/${teacherId}`);
      const data = await response.json();
      setTodaysClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLiveSessions = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/live-sessions/${teacherId}`);
      const data = await response.json();
      setLiveSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecordings = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/recordings/${teacherId}`);
      const data = await response.json();
      setRecordings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchChange = async (batch) => {
    setSelectedBatch(batch);
    await fetchTeacherClasses(batch.id);
  };

  const handleStartLive = (classData) => {
    setSelectedClass(classData);
    setLiveForm({
      title: `${classData.course_code} - ${classData.course_name}`,
      platform: classData.platform || "Google Meet",
      meeting_link: classData.meeting_link || ""
    });
    setShowStartModal(true);
  };

  const confirmStartLive = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/start-live/${selectedClass.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user?.userId,
          ...liveForm
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Live session started!");
        setShowStartModal(false);
        fetchLiveSessions(user?.userId);
        fetchTodaysClasses(user?.userId);
      } else {
        alert(data.error || "Error starting live session");
      }
    } catch (err) {
      console.error(err);
      alert("Error starting live session");
    }
  };

  const handleEndLive = async (sessionId) => {
    if (!window.confirm("Are you sure you want to end this live session?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/end-live/${sessionId}`, {
        method: "POST"
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Live session ended!");
        fetchLiveSessions(user?.userId);
        fetchTodaysClasses(user?.userId);
      } else {
        alert(data.error || "Error ending session");
      }
    } catch (err) {
      console.error(err);
      alert("Error ending session");
    }
  };

  const handleAddRecording = async (sessionId) => {
    const recordingUrl = prompt("Enter the recording URL (Google Drive, YouTube, etc.):");
    if (!recordingUrl) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/add-recording/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recording_url: recordingUrl })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Recording added successfully!");
        fetchRecordings(user?.userId);
      } else {
        alert(data.error || "Error adding recording");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding recording");
    }
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    const dayClasses = weeklySchedule[day] || [];
    return dayClasses.find(c => c.start_time === timeSlot);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ongoing': return <span className="badge-ongoing">🟢 Ongoing</span>;
      case 'completed': return <span className="badge-completed">✅ Completed</span>;
      case 'upcoming': return <span className="badge-upcoming">⏳ Upcoming</span>;
      default: return <span className="badge-scheduled">📅 Scheduled</span>;
    }
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
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

      <main className="teacher-live-sessions">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/teacher-dashboard')}>← Back to Dashboard</button>
          <h1>Live Session Management</h1>
          <p>Start, manage, and record your live classes</p>
        </div>

        {/* Active Live Sessions */}
        {liveSessions.length > 0 && (
          <div className="active-live-section">
            <h2>🔴 Active Live Sessions</h2>
            {liveSessions.map(session => (
              <div key={session.id} className="active-live-card">
                <div className="live-indicator">🔴 LIVE</div>
                <div className="active-live-info">
                  <h3>{session.title || `${session.course_code} - ${session.course_name}`}</h3>
                  <p>Batch: {session.batch_name}</p>
                  <p>Platform: {session.platform}</p>
                  {session.meeting_link && (
                    <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="meeting-link">
                      Join Meeting →
                    </a>
                  )}
                </div>
                <div className="active-live-actions">
                  <button className="end-live-btn" onClick={() => handleEndLive(session.id)}>End Session</button>
                  <button className="add-recording-btn" onClick={() => handleAddRecording(session.id)}>Add Recording</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Batch Selector */}
        <div className="batch-selector">
          <label>Select Batch:</label>
          <div className="batch-buttons">
            {batches.map(batch => (
              <button
                key={batch.id}
                className={`batch-btn ${selectedBatch?.id === batch.id ? 'active' : ''}`}
                onClick={() => handleBatchChange(batch)}
              >
                {batch.batch_name}
              </button>
            ))}
          </div>
        </div>

        {/* Classes by Batch */}
        {selectedBatch && (
          <div className="classes-section">
            <h2>📋 My Classes - {selectedBatch.batch_name}</h2>
            <div className="classes-table-container">
              <table className="classes-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Course</th>
                    <th>Room/Platform</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => (
                    <tr key={cls.id}>
                      <td>{cls.day_of_week}</td>
                      <td>{cls.start_time} - {cls.end_time}</td>
                      <td>
                        <strong>{cls.course_code}</strong><br />
                        <small>{cls.course_name}</small>
                      </td>
                      <td>{cls.room || cls.platform}</td>
                      <td>{getStatusBadge(cls.current_status)}</td>
                      <td>
                        {cls.current_status === 'ongoing' || cls.current_status === 'upcoming' ? (
                          <button className="start-live-btn" onClick={() => handleStartLive(cls)}>
                            🎥 Start Live
                          </button>
                        ) : (
                          <button className="start-live-btn disabled" disabled>Session Ended</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly Schedule Table */}
        <div className="schedule-section">
          <h2>📅 Your Weekly Schedule (All Batches)</h2>
          <div className="schedule-table-container">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  {days.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, idx) => {
                  const slotLabel = timeSlotLabels[idx];
                  return (
                    <tr key={idx}>
                      <td className="time-slot">{slotLabel}</td>
                      {days.map(day => {
                        const classData = getClassForTimeSlot(day, slot);
                        return (
                          <td key={day} className={classData?.status === 'ongoing' ? 'ongoing-cell' : classData?.status === 'completed' ? 'completed-cell' : ''}>
                            {classData ? (
                              <div className="class-info">
                                <div className="class-code">{classData.course_code}</div>
                                <div className="class-name">{classData.course_name}</div>
                                <div className="batch-name">{classData.batch_name}</div>
                                <div className="class-room">{classData.room || classData.platform}</div>
                                {getStatusBadge(classData.status)}
                              </div>
                            ) : (
                              <span className="no-class">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="todays-classes-section">
          <h2>📅 Today's Classes</h2>
          {todaysClasses.length > 0 ? (
            todaysClasses.map(cls => (
              <div key={cls.id} className="today-class-item">
                <div className="class-time">{cls.start_time} - {cls.end_time}</div>
                <div className="class-details">
                  <strong>{cls.course_code} - {cls.course_name}</strong>
                  <span>{cls.batch_name} • {cls.room || cls.platform}</span>
                </div>
                <div className="class-status">{getStatusBadge(cls.status)}</div>
                {(cls.status === 'ongoing' || cls.status === 'upcoming') && (
                  <button className="start-live-small" onClick={() => handleStartLive(cls)}>Start Live</button>
                )}
              </div>
            ))
          ) : (
            <p className="no-classes">No classes scheduled for today</p>
          )}
        </div>

        {/* Recordings */}
        <div className="recordings-section">
          <h2>📹 Your Recorded Sessions</h2>
          <div className="recordings-list">
            {recordings.length > 0 ? (
              recordings.map(recording => (
                <div key={recording.id} className="recording-item">
                  <div className="recording-icon">🎥</div>
                  <div className="recording-info">
                    <div className="recording-title">{recording.title || `${recording.course_code} - ${recording.course_name}`}</div>
                    <div className="recording-meta">
                      {recording.batch_name} • {recording.instructor_name} • {recording.formatted_date}
                      {recording.days_ago === 0 ? ' (Today)' : recording.days_ago === 1 ? ' (Yesterday)' : ` (${recording.days_ago} days ago)`}
                    </div>
                  </div>
                  <a href={recording.recording_url} target="_blank" rel="noopener noreferrer" className="watch-btn">Watch Recording</a>
                </div>
              ))
            ) : (
              <p className="no-recordings">No recorded sessions yet</p>
            )}
          </div>
        </div>
      </main>

      {/* Start Live Modal */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎥 Start Live Session</h2>
              <button className="close-modal" onClick={() => setShowStartModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Session Title</label>
                <input 
                  type="text" 
                  value={liveForm.title} 
                  onChange={(e) => setLiveForm({...liveForm, title: e.target.value})}
                  placeholder="Session title"
                />
              </div>
              
              <div className="form-group">
                <label>Platform</label>
                <select value={liveForm.platform} onChange={(e) => setLiveForm({...liveForm, platform: e.target.value})}>
                  <option>Google Meet</option>
                  <option>Zoom</option>
                  <option>Microsoft Teams</option>
                  <option>YouTube Live</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Meeting Link</label>
                <input 
                  type="url" 
                  value={liveForm.meeting_link} 
                  onChange={(e) => setLiveForm({...liveForm, meeting_link: e.target.value})}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
                <small>Students will use this link to join your live session</small>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button type="button" onClick={() => setShowStartModal(false)}>Cancel</button>
              <button type="button" onClick={confirmStartLive}>Start Live Session</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherLiveSessions;