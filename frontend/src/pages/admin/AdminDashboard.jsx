import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    createFloatingShapes();
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

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">⚙️ SWEHub - Admin Panel</div>
          <div className="user-section">
            <span>Welcome, {user?.name || "Admin"}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-icon">👥</div>
            <h3>Manage Users</h3>
            <p>Add, edit, or remove users</p>
          </div>
          <div className="card">
            <div className="card-icon">📚</div>
            <h3>Manage Courses</h3>
            <p>Create and manage courses</p>
          </div>
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>System Analytics</h3>
            <p>View system statistics and reports</p>
          </div>
          <div className="card">
            <div className="card-icon">🏫</div>
            <h3>Manage Batches</h3>
            <p>Add or modify batches</p>
          </div>
          <div className="card">
            <div className="card-icon">⚙️</div>
            <h3>System Settings</h3>
            <p>Configure system parameters</p>
          </div>
          <div className="card">
            <div className="card-icon">📅</div>
            <h3>Academic Calendar</h3>
            <p>Manage academic schedule</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;