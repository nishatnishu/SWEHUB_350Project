import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AssignmentDetails.css";

function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textSubmission, setTextSubmission] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    
    if (id) {
      fetchAssignmentDetails();
    }
    createFloatingShapes();
  }, [id]);

  const fetchAssignmentDetails = () => {
    fetch(`http://localhost:5000/api/student/assignments/${id}?student_id=STU001`)
      .then((res) => res.json())
      .then((data) => {
        setAssignment(data);
        if (data.submissions && data.submissions.length > 0) {
          setSubmissionStatus('submitted');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (assignment && assignment.deadline) {
      const timer = setInterval(() => {
        const now = new Date();
        const deadline = new Date(assignment.deadline);
        const diff = deadline - now;

        if (diff <= 0) {
          setTimeRemaining({ expired: true });
          clearInterval(timer);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (86400000)) / (3600000));
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining({ days, hours, minutes, seconds, expired: false });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [assignment]);

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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile && !textSubmission) {
      alert("Please upload a file or add text submission");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('student_id', user?.userId || 'STU001');
    formData.append('student_name', user?.name || 'Student');
    formData.append('text_submission', textSubmission);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/student/assignments/${id}/submit`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert("Assignment submitted successfully!");
        setTextSubmission("");
        setSelectedFile(null);
        setSubmissionStatus('submitted');
        fetchAssignmentDetails();
      } else {
        alert(data.error || "Error submitting assignment");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting assignment");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleBack = () => {
    navigate('/assignments');
  };

  if (loading) {
    return (
      <div className="details-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assignment details...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="details-empty-state">
        <h2>Assignment not found</h2>
        <button className="back-btn" onClick={handleBack}>Back to Assignments</button>
      </div>
    );
  }

  const isDeadlinePassed = timeRemaining?.expired;
  const canSubmit = assignment.status === 'open' && !isDeadlinePassed && submissionStatus !== 'submitted';

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <div className="assignment-details-container">
        <header className="details-header">
          <div className="logo" onClick={handleBack} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">🎓</div>
            <div className="logo-text">SWE<span>Hub</span></div>
          </div>
          <div className="user-section">
            <div className="user-avatar">👤</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="details-content">
          <button className="back-to-list" onClick={handleBack}>← Back to Assignments</button>
          
          <h1>{assignment.title}</h1>
          
          <div className="assignment-meta">
            <span className={`status-badge ${assignment.status === 'open' && !isDeadlinePassed ? 'status-open' : 'status-closed'}`}>
              {assignment.status === 'open' && !isDeadlinePassed ? '📝 Open' : '🔒 Closed'}
            </span>
            <span className="deadline">📅 Due: {new Date(assignment.deadline).toLocaleString()}</span>
            {timeRemaining && !timeRemaining.expired && (
              <span className="time-remaining">⏰ Time left: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m</span>
            )}
            {timeRemaining?.expired && (
              <span className="time-expired">⚠️ Deadline has passed</span>
            )}
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Course:</span>
              <span>{assignment.course_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span>{assignment.type}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Weightage:</span>
              <span>{assignment.weightage}%</span>
            </div>
            <div className="info-row">
              <span className="info-label">Max Score:</span>
              <span>{assignment.max_score}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Late Penalty:</span>
              <span>{assignment.late_penalty}%</span>
            </div>
          </div>

          <div className="description-section">
            <h3>📖 Assignment Description</h3>
            <p className={!showFullDescription ? 'collapsed' : ''}>{assignment.description}</p>
            <button className="toggle-btn" onClick={() => setShowFullDescription(!showFullDescription)}>
              {showFullDescription ? '▲ Show Less' : '▼ Show Full Description'}
            </button>
          </div>

          {assignment.resources && assignment.resources.length > 0 && (
            <div className="resources-section">
              <h3>📎 Resources & Files</h3>
              {assignment.resources.map((resource, idx) => (
                <div key={idx} className="resource-item">
                  <span className="resource-name">📄 {resource.file_name}</span>
                  <span className="resource-size">{resource.file_size}</span>
                  <button className="download-btn" onClick={() => window.open(`http://localhost:5000${resource.file_url}`)}>
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="submission-section">
            <h3>📤 Submission Panel</h3>
            {submissionStatus === 'submitted' ? (
              <div className="already-submitted">
                <div className="submission-success">✅ You have already submitted this assignment</div>
                <div className="submission-note">📌 Your submission has been recorded. You cannot submit again.</div>
              </div>
            ) : canSubmit ? (
              <>
                <div className="file-upload">
                  <label>File Upload</label>
                  <div className="drop-zone">
                    <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.zip,.java,.py,.txt" />
                    <p>📎 Click to upload or drag and drop</p>
                    <small>Max 50MB • PDF, DOCX, ZIP, JAVA, PY, TXT</small>
                  </div>
                  {selectedFile && <div className="selected-file">📄 Selected: {selectedFile.name}</div>}
                </div>
                <div className="text-submission">
                  <label>Text Submission (Optional)</label>
                  <textarea 
                    rows="4" 
                    placeholder="You can add additional notes or paste code snippets here..."
                    value={textSubmission} 
                    onChange={(e) => setTextSubmission(e.target.value)} 
                  />
                </div>
                <button className="submit-btn" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "📤 Uploading..." : "🚀 Submit Assignment"}
                </button>
              </>
            ) : (
              <div className="cannot-submit">
                {isDeadlinePassed ? "⏰ Deadline has passed. Cannot submit." : "🔒 Assignment is closed for submissions."}
              </div>
            )}
          </div>

          {assignment.submissions && assignment.submissions.length > 0 && (
            <div className="submission-history">
              <h3>📋 Submission History & Feedback</h3>
              {assignment.submissions.map((sub, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-date">📅 Submitted: {new Date(sub.submission_date).toLocaleString()}</div>
                  {sub.file_name && <div className="history-file">📄 {sub.file_name}</div>}
                  {sub.text_submission && <div className="history-text">💬 {sub.text_submission}</div>}
                  {sub.grade && <div className="history-grade">⭐ Grade: {sub.grade}/{assignment.max_score}</div>}
                  {sub.feedback && <div className="history-feedback">📝 Feedback: {sub.feedback}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AssignmentDetails;