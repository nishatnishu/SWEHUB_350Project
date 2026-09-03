import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LiveSessions.css";

function LiveSessions() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [liveSession, setLiveSession] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isCR, setIsCR] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeSlots = ['08:30:00', '10:30:00', '12:30:00', '14:30:00', '16:30:00'];
  const timeSlotLabels = ['8:30 - 10:00', '10:30 - 12:00', '12:30 - 14:00', '14:30 - 16:00', '16:30 - 18:00'];

  useEffect(() => {
    fetchBatches();
    checkUserStatus();
    createFloatingShapes();
  }, []);

  useEffect(() => {
    if (liveSession && liveSession.status === 'live') {
      const timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date();
        const [hours, minutes] = (liveSession.end_time || '12:00:00').split(':');
        endTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const diff = endTime - now;
        if (diff <= 0) {
          setTimeRemaining({ expired: true });
          clearInterval(timer);
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeRemaining({ minutes: mins, seconds: secs, expired: false });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [liveSession]);

  const checkUserStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const crFromUrl = urlParams.get('cr') === 'true';
    const crFromSession = sessionStorage.getItem('isCR') === 'true';
    setIsCR(crFromUrl || crFromSession);
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/student/batches");
      const data = await response.json();
      setBatches(data);
      if (data.length > 0) {
        setSelectedBatch(data[0]);
        await fetchAllData(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setLoading(false);
    }
  };

  const fetchAllData = async (batchId) => {
    await Promise.all([
      fetchWeeklySchedule(batchId),
      fetchTodaysSessions(batchId),
      fetchLiveSession(batchId),
      fetchRecordings(batchId)
    ]);
  };

  const fetchWeeklySchedule = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/weekly-schedule/${batchId}`);
      const data = await response.json();
      setWeeklySchedule(data);
    } catch (err) {
      console.error("Error fetching weekly schedule:", err);
    }
  };

  const fetchTodaysSessions = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/todays-sessions/${batchId}`);
      const data = await response.json();
      setTodaysSessions(data);
    } catch (err) {
      console.error("Error fetching today's sessions:", err);
    }
  };

  const fetchLiveSession = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/live-session/${batchId}`);
      const data = await response.json();
      setLiveSession(data);
    } catch (err) {
      console.error("Error fetching live session:", err);
    }
  };

  const fetchRecordings = async (batchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/recordings/${batchId}`);
      const data = await response.json();
      setRecordings(data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
    }
  };

  const handleBatchChange = async (batch) => {
    setSelectedBatch(batch);
    setLoading(true);
    await fetchAllData(batch.id);
    setLoading(false);
  };

  const handleJoinSession = async (session) => {
    if (session.meeting_link) {
      await fetch(`http://localhost:5000/api/student/join-session/${session.id}`, { method: 'POST' });
      window.open(session.meeting_link, '_blank');
    } else if (session.platform === 'Physical') {
      alert(`Physical class in ${session.room || 'Room TBA'}`);
    } else {
      alert("Meeting link will be available when the session starts");
    }
  };

  const handleMarkAttendance = (session) => {
    setSelectedSession(session);
    setShowAttendanceModal(true);
  };

  const confirmAttendance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/attendance/${selectedSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: 'STU001', student_name: 'John Doe' })
      });
      const data = await response.json();
      if (data.success) {
        alert("Attendance marked successfully!");
        setShowAttendanceModal(false);
      } else {
        alert(data.error || "Error marking attendance");
      }
    } catch (err) {
      console.error(err);
      alert("Error marking attendance");
    }
  };

  const getSessionForTimeSlot = (day, timeSlot) => {
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
    sessionStorage.clear();
    window.location.href = '/login.html';
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

      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">🎓</div>
            <div className="logo-text">SWE<span>Hub</span></div>
          </div>
          <div className="user-section">
            {isCR && <div className="cr-badge"><span>👑</span><span>Class Representative</span></div>}
            <div className="user-avatar">👤</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="live-sessions">
        <div className="sessions-header">
          <button className="back-dashboard" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1>Live Sessions & Routine</h1>
          <p>View your schedule and join live classes</p>
        </div>

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

        {/* Live Session Card */}
        {liveSession && liveSession.status === 'live' && (
          <div className="live-session-card">
            <div className="live-badge">🔴 LIVE NOW</div>
            <div className="live-content">
              <div className="live-info">
                <h2>{liveSession.title || `${liveSession.course_code} - ${liveSession.course_name}`}</h2>
                <p>👨‍🏫 Instructor: {liveSession.instructor_name}</p>
                <p>💻 Platform: {liveSession.platform}</p>
                {timeRemaining && !timeRemaining.expired && (
                  <p>⏱️ Time Remaining: {timeRemaining.minutes}:{String(timeRemaining.seconds).padStart(2, '0')}</p>
                )}
              </div>
              <div className="live-actions">
                <button className="join-live-btn" onClick={() => handleJoinSession(liveSession)}>🎥 Join Session</button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Schedule Table */}
        <div className="schedule-section">
          <h2>Weekly Class Schedule</h2>
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
                        const classData = getSessionForTimeSlot(day, slot);
                        return (
                          <td key={day} className={classData?.status === 'ongoing' ? 'ongoing-cell' : classData?.status === 'completed' ? 'completed-cell' : ''}>
                            {classData ? (
                              <div className="class-info">
                                <div className="class-code">{classData.course_code}</div>
                                <div className="class-name">{classData.course_name}</div>
                                <div className="instructor">{classData.instructor_name}</div>
                                <div className="class-room">{classData.room || classData.platform}</div>
                                {getStatusBadge(classData.status)}
                                {classData.status === 'ongoing' && classData.meeting_link && (
                                  <button className="join-small" onClick={() => handleJoinSession(classData)}>Join</button>
                                )}
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

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="todays-sessions">
            <h2>Today's Sessions</h2>
            {todaysSessions.length > 0 ? (
              todaysSessions.map(session => (
                <div key={session.id} className="today-session-item">
                  <div className="session-time">{session.start_time} - {session.end_time}</div>
                  <div className="session-details">
                    <strong>{session.course_name}</strong>
                    <span>{session.instructor_name} • {session.room || session.platform}</span>
                  </div>
                  <div className="session-actions">
                    {session.status === 'ongoing' && (
                      <button className="join-btn-small" onClick={() => handleJoinSession(session)}>Join</button>
                    )}
                    <button className="attendance-btn-small" onClick={() => handleMarkAttendance(session)}>✅ Mark</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-sessions">📭 No classes scheduled for today</p>
            )}
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="quick-buttons">
              <button className="quick-btn" onClick={() => document.querySelector('.schedule-section')?.scrollIntoView({ behavior: 'smooth' })}>🎥 Join Live</button>
              <button className="quick-btn" onClick={() => navigate('/study-materials')}>📚 Materials</button>
              <button className="quick-btn">✅ Attendance</button>
              <button className="quick-btn">💬 Feedback</button>
            </div>
          </div>
        </div>

        {/* Recent Recordings */}
        <div className="recordings-section">
          <h2>Recent Recordings</h2>
          <div className="recordings-list">
            {recordings.length > 0 ? (
              recordings.map(recording => (
                <div key={recording.id} className="recording-item">
                  <div className="recording-icon">🎥</div>
                  <div className="recording-info">
                    <div className="recording-title">{recording.title || `${recording.course_code} - ${recording.course_name}`}</div>
                    <div className="recording-meta">{recording.instructor_name} • {recording.days_ago === 0 ? 'Today' : recording.days_ago === 1 ? 'Yesterday' : `${recording.days_ago} days ago`}</div>
                  </div>
                  <button className="watch-btn" onClick={() => window.open(`http://localhost:5000${recording.recording_url}`, '_blank')}>Watch</button>
                </div>
              ))
            ) : (
              <p className="no-recordings">📭 No recordings available</p>
            )}
          </div>
        </div>
      </main>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <h2>Mark Attendance</h2>
            <p>Are you present for <strong>{selectedSession?.course_name}</strong>?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowAttendanceModal(false)}>Cancel</button>
              <button onClick={confirmAttendance}>Yes, Mark Present</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveSessions;