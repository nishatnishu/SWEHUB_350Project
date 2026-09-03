import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    createFloatingShapes();
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
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

      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">📚 SWEHub - Teacher Panel</div>
          <div className="user-section">
            <span>Welcome, {user?.name || "Teacher"}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <h1>Teacher Dashboard</h1>
        
        <div className="dashboard-cards">
          {/* Assignment Management Card - Clickable */}
          <div className="card" onClick={() => navigate("/teacher/assignments")}>
            <div className="card-icon">📋</div>
            <h3>Assignment & Project Management</h3>
            <p>Create, edit, and manage assignments for your courses</p>
            <div className="card-footer">Click to manage →</div>
          </div>

          <div className="card" onClick={() => navigate("/teacher/live-sessions")}>
  <div className="card-icon">🎥</div>
  <h3>Live Session Management</h3>
  <p>Start, manage, and record live classes</p>
  <div className="card-footer">Start live class →</div>
</div>

          {/* View Students Card */}
          <div className="card" onClick={() => navigate("/teacher/students")}>
            <div className="card-icon">👥</div>
            <h3>View Students</h3>
            <p>See enrolled students in your courses</p>
            <div className="card-footer">Coming soon →</div>
          </div>

          <div className="card" onClick={() => navigate("/teacher/announcements")}>
  <div className="card-icon">📢</div>
  <h3>Announcements</h3>
  <p>Post updates for students</p>
</div>

          {/* Schedule Card */}
          <div className="card" onClick={() => navigate("/teacher/schedule")}>
            <div className="card-icon">📅</div>
            <h3>Class Schedule</h3>
            <p>Manage your class schedule</p>
            <div className="card-footer">Coming soon →</div>
          </div>

          {/* Study Materials Card */}
          <div className="card" onClick={() => navigate("/teacher/materials")}>
  <div className="card-icon">📚</div>
  <h3>Study Materials</h3>
  <p>Upload lecture notes and resources</p>
  <div className="card-footer">Upload materials →</div>
</div>
        </div>
      </main>
    </>
  );
}

export default TeacherDashboard;