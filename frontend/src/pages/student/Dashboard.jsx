import { useEffect, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [isCR, setIsCR] = useState(false);

  // useEffect(() => {
  //   fetch("http://localhost:5000/api/student/dashboard")
  //     .then((res) => res.json())
  //     .then((data) => setData(data))
  //     .catch((err) => console.error(err));

  //   const urlParams = new URLSearchParams(window.location.search);
  //   const crFromUrl = urlParams.get('cr') === 'true';
  //   const crFromSession = sessionStorage.getItem('isCR') === 'true';
  //   setIsCR(crFromUrl || crFromSession);

  //   let name = urlParams.get('name') || sessionStorage.getItem('userName') || 'Student';
  //   setStudentName(name);
    
  //   createFloatingShapes();
  // }, []);


  useEffect(() => {
  // Get logged-in user from localStorage (add this)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.name) {
    setStudentName(user.name);
  }
  
  // Check if user is CR from user role (replace the old CR check)
  if (user.role === 'cr') {
    setIsCR(true);
  }
  
  fetch("http://localhost:5000/api/student/dashboard")
    .then((res) => res.json())
    .then((data) => setData(data))
    .catch((err) => console.error(err));
  
  createFloatingShapes();
}, []);

  const createFloatingShapes = () => {
    const container = document.getElementById('floatingShapes');
    if (!container) return;
    
    const shapes = ['circle', 'square'];
    const shapeCount = 12;

    for (let i = 0; i < shapeCount; i++) {
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

  // const handleLogout = () => {
  //   sessionStorage.clear();
  //   window.location.href = '/login.html';
  // };

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

  // const handleCardClick = (path) => {
  //   window.location.href = path;
  // };

  const handleCardClick = (path) => {
  navigate(path);
};

  const stats = {
    activeCourses: data?.totalCourses || 8,
    pendingAssignments: data?.assignments || 3,
    upcomingClasses: 2,
    currentCGPA: 3.75
  };

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <header className="header">
        <div className="header-content">
          <div className="logo">
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

      <main className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome back, {studentName}! 👋</h1>
          <p className="welcome-subtitle">Here's what's happening in your academic journey</p>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.activeCourses}</div>
            <div className="stat-label">Active Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingAssignments}</div>
            <div className="stat-label">Pending Assignments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.upcomingClasses}</div>
            <div className="stat-label">Upcoming Classes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.currentCGPA}</div>
            <div className="stat-label">Current CGPA</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => handleCardClick('/assignments')}>
            <div className="card-icon">📋</div>
            <h3 className="card-title">Assignments & Projects</h3>
            <p className="card-description">View, submit and track your assignments and team projects</p>
          </div>

          <div className="dashboard-card" onClick={() => handleCardClick('/study-materials')}>
            <div className="card-icon">📚</div>
            <h3 className="card-title">Study Materials</h3>
            <p className="card-description">Access lecture notes, reference books, and resources</p>
          </div>

          <div className="dashboard-card" onClick={() => handleCardClick('/live-sessions')}>
            <div className="card-icon">🕐</div>
            <h3 className="card-title">Live Session & Routine</h3>
            <p className="card-description">Check today's schedule and fixed class routines</p>
          </div>

          <div className="dashboard-card" onClick={() => handleCardClick('results.html')}>
            <div className="card-icon">📊</div>
            <h3 className="card-title">Results</h3>
            <p className="card-description">View your semester results and academic performance</p>
          </div>

          <div className="dashboard-card" onClick={() => handleCardClick('/course-overview')}>
            <div className="card-icon">📖</div>
            <h3 className="card-title">Course Overview</h3>
            <p className="card-description">Browse all courses with credits and descriptions</p>
          </div>
              <div className="card" onClick={() => navigate("/student/announcements")}>
  <div className="card-icon">📢</div>
  <h3>Announcements</h3>
  <p>View teacher updates</p>
</div>
          <div className="dashboard-card" onClick={() => handleCardClick('interactive.html')}>
            <div className="card-icon">💬</div>
            <h3 className="card-title">Interactive Section</h3>
            <p className="card-description">Message teachers and join course discussions</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;