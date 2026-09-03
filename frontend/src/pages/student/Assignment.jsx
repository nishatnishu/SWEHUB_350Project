// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Assignment.css";

// function Assignment() {
//   const navigate = useNavigate();
//   const [assignments, setAssignments] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isCR, setIsCR] = useState(false);

//   useEffect(() => {
//     fetch("http://localhost:5000/api/student/assignments")
//       .then((res) => res.json())
//       .then((data) => {
//         setAssignments(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Fetch error:", err);
//         setLoading(false);
//       });

//     const urlParams = new URLSearchParams(window.location.search);
//     const crFromUrl = urlParams.get('cr') === 'true';
//     const crFromSession = sessionStorage.getItem('isCR') === 'true';
//     setIsCR(crFromUrl || crFromSession);

//     createFloatingShapes();
//   }, []);

//   const createFloatingShapes = () => {
//     const container = document.getElementById('floatingShapes');
//     if (!container) return;
    
//     container.innerHTML = '';
//     const shapes = ['circle', 'square'];
//     const shapeCount = 12;

//     for (let i = 0; i < shapeCount; i++) {
//       const shape = document.createElement('div');
//       const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
//       shape.className = `shape shape-${shapeType}`;
//       const size = Math.random() * 60 + 30;
//       shape.style.width = size + 'px';
//       shape.style.height = size + 'px';
//       shape.style.left = Math.random() * 100 + '%';
//       shape.style.animationDuration = (Math.random() * 25 + 30) + 's';
//       shape.style.animationDelay = Math.random() * 15 + 's';
//       container.appendChild(shape);
//     }
//   };

//   const handleLogout = () => {
//     sessionStorage.clear();
//     window.location.href = '/login.html';
//   };

//   const handleViewDetails = (assignmentId) => {
//     navigate(`/assignments/${assignmentId}`);
//   };

//   const getFilteredAssignments = () => {
//     if (!assignments) return [];
//     if (!searchTerm.trim()) return assignments;
    
//     const searchLower = searchTerm.toLowerCase();
//     return assignments.filter(assignment => 
//       assignment.title?.toLowerCase().includes(searchLower) ||
//       assignment.course_name?.toLowerCase().includes(searchLower) ||
//       assignment.type?.toLowerCase().includes(searchLower)
//     );
//   };

//   const getStats = () => {
//     if (!assignments) return { total: 0, open: 0 };
//     const total = assignments.length;
//     const open = assignments.filter(a => a.status === 'open').length;
//     return { total, open };
//   };

//   const stats = getStats();
//   const filteredAssignments = getFilteredAssignments();

//   if (loading) {
//     return (
//       <>
//         <div className="background"></div>
//         <div className="floating-shapes" id="floatingShapes"></div>
//         <div className="gradient-orb orb-1"></div>
//         <div className="gradient-orb orb-2"></div>
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading assignments...</p>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="background"></div>
//       <div className="floating-shapes" id="floatingShapes"></div>
//       <div className="gradient-orb orb-1"></div>
//       <div className="gradient-orb orb-2"></div>

//       <header className="header">
//         <div className="header-content">
//           <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
//             <div className="logo-icon">🎓</div>
//             <div className="logo-text">SWE<span>Hub</span></div>
//           </div>
//           <div className="user-section">
//             {isCR && (
//               <div className="cr-badge">
//                 <span>👑</span>
//                 <span>Class Representative</span>
//               </div>
//             )}
//             <div className="user-avatar">👤</div>
//             <button className="logout-btn" onClick={handleLogout}>Logout</button>
//           </div>
//         </div>
//       </header>

//       <main className="main-content">
//         <div className="welcome-section">
//           <h1 className="welcome-title">Assignments & Projects</h1>
//           <p className="welcome-subtitle">Track and manage your academic tasks</p>
//         </div>

//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-value">{stats.total}</div>
//             <div className="stat-label">Total Assignments</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value">{stats.open}</div>
//             <div className="stat-label">Open Assignments</div>
//           </div>
//         </div>

//         <div className="assignments-container">
//           <div className="table-header">
//             <h2>Assignment List</h2>
//             <input 
//               type="text" 
//               placeholder="Search assignments..." 
//               className="search-input"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
          
//           <div className="table-responsive">
//             <table className="assignments-table">
//               <thead>
//                 <tr>
//                   <th>Title</th>
//                   <th>Course</th>
//                   <th>Type</th>
//                   <th>Deadline</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAssignments.map((a) => (
//                   <tr key={a.id}>
//                     <td>{a.title}</td>
//                     <td>{a.course_name}</td>
//                     <td><span className={`type-badge type-${a.type}`}>{a.type}</span></td>
//                     <td>{a.deadline}</td>
//                     <td>
//                       <button className="view-btn" onClick={() => handleViewDetails(a.id)}>
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// export default Assignment;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Assignment.css";

function Assignment() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCR, setIsCR] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    
    fetch("http://localhost:5000/api/student/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    setIsCR(storedUser.role === 'cr');
    createFloatingShapes();
  }, []);

  const isDeadlinePassed = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (deadline, status) => {
    if (status === 'closed') {
      return <span className="status-closed">🔒 Closed</span>;
    }
    if (isDeadlinePassed(deadline)) {
      return <span className="status-passed">⏰ Deadline Passed</span>;
    }
    return <span className="status-open">📝 Open</span>;
  };

  const createFloatingShapes = () => {
    const container = document.getElementById('floatingShapes');
    if (!container) return;
    
    container.innerHTML = '';
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewDetails = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
  };

  const getFilteredAssignments = () => {
    if (!assignments) return [];
    if (!searchTerm.trim()) return assignments;
    
    const searchLower = searchTerm.toLowerCase();
    return assignments.filter(assignment => 
      assignment.title?.toLowerCase().includes(searchLower) ||
      assignment.course_name?.toLowerCase().includes(searchLower) ||
      assignment.type?.toLowerCase().includes(searchLower)
    );
  };

  const getStats = () => {
    if (!assignments) return { total: 0, open: 0, passed: 0 };
    const total = assignments.length;
    const open = assignments.filter(a => a.status === 'open' && !isDeadlinePassed(a.deadline)).length;
    const passed = assignments.filter(a => isDeadlinePassed(a.deadline)).length;
    return { total, open, passed };
  };

  const stats = getStats();
  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <>
        <div className="background"></div>
        <div className="floating-shapes" id="floatingShapes"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Assignments Available</h3>
          <p>Check back later for new assignments</p>
          <button className="back-btn" onClick={handleBackToDashboard}>Back to Dashboard</button>
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
          <div className="logo" onClick={handleBackToDashboard} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">🎓</div>
            <div className="logo-text">SWE<span>Hub</span></div>
          </div>
          <div className="user-section">
            <div className="user-avatar">👤</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Assignments & Projects</h1>
          <p className="welcome-subtitle">Track and manage your academic tasks</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Assignments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.open}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.passed}</div>
            <div className="stat-label">Deadline Passed</div>
          </div>
        </div>

        <div className="assignments-container">
          <div className="table-header">
            <h2>Assignment List</h2>
            <input 
              type="text" 
              placeholder="Search assignments..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="table-responsive">
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="assignment-title">{assignment.title}</td>
                    <td>{assignment.course_name}</td>
                    <td>
                      <span className={`type-badge type-${assignment.type}`}>
                        {assignment.type}
                      </span>
                    </td>
                    <td>{formatDeadline(assignment.deadline)}</td>
                    <td>{getStatusBadge(assignment.deadline, assignment.status)}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewDetails(assignment.id)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="back-to-dashboard">
          <button className="back-dashboard-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </>
  );
}

export default Assignment;