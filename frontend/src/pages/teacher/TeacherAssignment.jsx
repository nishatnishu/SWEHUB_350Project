// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./TeacherAssignment.css";

// function TeacherAssignment() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [assignments, setAssignments] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
//   const [showGradeModal, setShowGradeModal] = useState(false);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
//   const [submissions, setSubmissions] = useState([]);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     type: "assignment",
//     deadline: "",
//     weightage: 10,
//     max_score: 100,
//     late_penalty: 10
//   });

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
//     setUser(storedUser);
//     if (storedUser.userId) {
//       fetchCourses(storedUser.userId);
//     }
//     createFloatingShapes();
//   }, []);

//   const fetchCourses = async (teacherId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/courses/${teacherId}`);
//       const data = await response.json();
//       setCourses(data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   const fetchAssignments = async (courseCode) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/assignments/${courseCode}?teacherId=${user?.userId}`);
//       const data = await response.json();
//       setAssignments(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchSubmissions = async (assignmentId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/submissions/${user?.userId}/${assignmentId}`);
//       const data = await response.json();
//       setSubmissions(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const getDeadlineStatusBadge = (assignment) => {
//     const now = new Date();
//     const deadline = new Date(assignment.deadline);
//     const isPassed = now > deadline;
    
//     if (assignment.status === 'closed') {
//       return <span className="deadline-badge closed">🔒 Closed</span>;
//     }
//     if (isPassed) {
//       return <span className="deadline-badge passed">⏰ Deadline Passed</span>;
//     }
//     return <span className="deadline-badge active">📝 Active</span>;
//   };

//   const handleCourseSelect = (course) => {
//     setSelectedCourse(course);
//     fetchAssignments(course.course_code);
//   };

//   const handleViewSubmissions = (assignment) => {
//     setSelectedAssignment(assignment);
//     fetchSubmissions(assignment.id);
//     setShowSubmissionsModal(true);
//   };

//   const handleGrade = (submission) => {
//     setSelectedSubmission(submission);
//     setGradeForm({ 
//       grade: submission.grade || "", 
//       feedback: submission.feedback || "" 
//     });
//     setShowGradeModal(true);
//   };

//   const handleSubmitGrade = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/grade/${user?.userId}/${selectedSubmission.id}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(gradeForm)
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         alert("✅ Grade submitted successfully!");
//         setShowGradeModal(false);
//         fetchSubmissions(selectedAssignment.id);
//       } else {
//         alert(data.error || "Error submitting grade");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error submitting grade");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleAddAssignment = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
    
//     const assignmentData = {
//       ...formData,
//       course_code: selectedCourse.course_code,
//       course_name: selectedCourse.course_name
//     };
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/add-assignment/${user?.userId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(assignmentData)
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         alert("✅ Assignment added successfully!");
//         setShowAddModal(false);
//         fetchAssignments(selectedCourse.course_code);
//         setFormData({
//           title: "",
//           description: "",
//           type: "assignment",
//           deadline: "",
//           weightage: 10,
//           max_score: 100,
//           late_penalty: 10
//         });
//       } else {
//         alert(data.error || "Error adding assignment");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error adding assignment");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteAssignment = async (assignmentId) => {
//     if (!window.confirm("⚠️ Are you sure you want to delete this assignment?")) return;
    
//     try {
//       const response = await fetch(`http://localhost:5000/api/teacher/delete-assignment/${user?.userId}/${assignmentId}`, {
//         method: "DELETE"
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         alert("✅ Assignment deleted successfully!");
//         fetchAssignments(selectedCourse.course_code);
//       } else {
//         alert(data.error || "Error deleting assignment");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error deleting assignment");
//     }
//   };

//   const createFloatingShapes = () => {
//     const container = document.getElementById('floatingShapes');
//     if (!container) return;
//     container.innerHTML = '';
//     for (let i = 0; i < 12; i++) {
//       const shape = document.createElement('div');
//       shape.className = `shape shape-${Math.random() > 0.5 ? 'circle' : 'square'}`;
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
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   if (loading) {
//     return (
//       <>
//         <div className="background"></div>
//         <div className="floating-shapes" id="floatingShapes"></div>
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading your courses...</p>
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

//       <header className="teacher-header">
//         <div className="header-content">
//           <div className="logo" onClick={() => navigate('/teacher-dashboard')} style={{ cursor: 'pointer' }}>
//             📚 SWEHub - Teacher Panel
//           </div>
//           <div className="user-section">
//             <span>Welcome, {user?.name || "Teacher"}</span>
//             <button className="logout-btn" onClick={handleLogout}>Logout</button>
//           </div>
//         </div>
//       </header>

//       <main className="teacher-assignment-container">
//         <div className="page-header">
//           <button className="back-btn" onClick={() => navigate('/teacher-dashboard')}>← Back to Dashboard</button>
//           <h1>Assignment Management</h1>
//           <p>Add, edit, or delete assignments for your courses</p>
//         </div>

//         {/* Courses Section */}
//         <div className="courses-section">
//           <h2>📚 My Courses</h2>
//           {courses.length === 0 ? (
//             <div className="no-courses">No courses assigned to you yet.</div>
//           ) : (
//             <div className="courses-grid">
//               {courses.map(course => (
//                 <div 
//                   key={course.id} 
//                   className={`course-card ${selectedCourse?.id === course.id ? 'active' : ''}`}
//                   onClick={() => handleCourseSelect(course)}
//                 >
//                   <div className="course-code">{course.course_code}</div>
//                   <div className="course-name">{course.course_name}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Assignments Section */}
//         {selectedCourse && (
//           <div className="assignments-section">
//             <div className="section-header">
//               <h2>📋 Assignments - {selectedCourse.course_name}</h2>
//               <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add New Assignment</button>
//             </div>
            
//             <div className="assignments-list">
//               {assignments.length === 0 ? (
//                 <div className="no-assignments">
//                   <div className="no-data-icon">📭</div>
//                   <p>No assignments yet. Click "Add New Assignment" to create one.</p>
//                 </div>
//               ) : (
//                 <table className="assignments-table">
//                   <thead>
//                     <tr>
//                       <th>Title</th>
//                       <th>Type</th>
//                       <th>Deadline</th>
//                       <th>Deadline Status</th>
//                       <th>Weightage</th>
//                       <th>Submissions</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {assignments.map(assignment => (
//                       <tr key={assignment.id}>
//                         <td className="assignment-title">{assignment.title}</td>
//                         <td>
//                           <span className={`type-badge type-${assignment.type}`}>
//                             {assignment.type}
//                           </span>
//                         </td>
//                         <td>{new Date(assignment.deadline).toLocaleDateString()}</td>
//                         <td>{getDeadlineStatusBadge(assignment)}</td>
//                         <td>{assignment.weightage}%</td>
//                         <td>
//                           <span className="submission-count">
//                             {assignment.submission_count || 0} submitted
//                           </span>
//                         </td>
//                         <td>
//                           <div className="action-buttons">
//                             <button 
//                               className="view-submissions-btn" 
//                               onClick={() => handleViewSubmissions(assignment)}
//                             >
//                               📋 View Submissions
//                             </button>
//                             <button 
//                               className="delete-btn" 
//                               onClick={() => handleDeleteAssignment(assignment.id)}
//                             >
//                               🗑️ Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Add Assignment Modal */}
//       {showAddModal && (
//         <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>➕ Add New Assignment</h2>
//               <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
//             </div>
            
//             <form onSubmit={handleAddAssignment}>
//               <div className="form-group">
//                 <label>Assignment Title *</label>
//                 <input 
//                   type="text" 
//                   required 
//                   value={formData.title} 
//                   onChange={(e) => setFormData({...formData, title: e.target.value})}
//                   placeholder="e.g., Data Structures Project"
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Description</label>
//                 <textarea 
//                   rows="4" 
//                   value={formData.description} 
//                   onChange={(e) => setFormData({...formData, description: e.target.value})}
//                   placeholder="Describe the assignment requirements..."
//                 />
//               </div>
              
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Assignment Type *</label>
//                   <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
//                     <option value="assignment">📝 Assignment</option>
//                     <option value="project">🚀 Project</option>
//                     <option value="quiz">📊 Quiz</option>
//                     <option value="exam">📖 Exam</option>
//                   </select>
//                 </div>
                
//                 <div className="form-group">
//                   <label>Deadline *</label>
//                   <input 
//                     type="datetime-local" 
//                     required 
//                     value={formData.deadline} 
//                     onChange={(e) => setFormData({...formData, deadline: e.target.value})}
//                   />
//                 </div>
//               </div>
              
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Weightage (%)</label>
//                   <input 
//                     type="number" 
//                     step="0.5" 
//                     value={formData.weightage} 
//                     onChange={(e) => setFormData({...formData, weightage: e.target.value})}
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <label>Late Penalty (%)</label>
//                   <input 
//                     type="number" 
//                     value={formData.late_penalty} 
//                     onChange={(e) => setFormData({...formData, late_penalty: e.target.value})}
//                   />
//                 </div>
//               </div>
              
//               <div className="form-group">
//                 <label>Max Score</label>
//                 <input 
//                   type="number" 
//                   value={formData.max_score} 
//                   onChange={(e) => setFormData({...formData, max_score: e.target.value})}
//                 />
//               </div>
              
//               <div className="modal-buttons">
//                 <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
//                 <button type="submit" disabled={submitting}>
//                   {submitting ? "Creating..." : "Create Assignment"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* View Submissions Modal */}
//       {showSubmissionsModal && (
//         <div className="modal-overlay" onClick={() => setShowSubmissionsModal(false)}>
//           <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>📋 Submissions - {selectedAssignment?.title}</h2>
//               <button className="close-modal" onClick={() => setShowSubmissionsModal(false)}>✕</button>
//             </div>
            
//             <div className="submissions-list">
//               {submissions.length === 0 ? (
//                 <div className="no-submissions">
//                   <div className="no-data-icon">📭</div>
//                   <p>No submissions yet for this assignment.</p>
//                 </div>
//               ) : (
//                 <table className="submissions-table">
//                   <thead>
//                     <tr>
//                       <th>Student Name</th>
//                       <th>Student ID</th>
//                       <th>Submission Date</th>
//                       <th>File</th>
//                       <th>Grade</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {submissions.map(sub => (
//                       <tr key={sub.id}>
//                         <td>{sub.student_name}</td>
//                         <td>{sub.student_id}</td>
//                         <td>{new Date(sub.submission_date).toLocaleString()}</td>
//                         <td>
//                           {sub.file_url && (
//                             <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noopener noreferrer" className="download-link">
//                               📥 Download File
//                             </a>
//                           )}
//                           {sub.text_submission && (
//                             <div className="text-submission-preview">
//                               📝 {sub.text_submission.substring(0, 50)}...
//                             </div>
//                           )}
//                         </td>
//                         <td>
//                           {sub.grade ? (
//                             <span className="grade-display">{sub.grade} / {selectedAssignment?.max_score || 100}</span>
//                           ) : (
//                             <span className="not-graded">Not graded</span>
//                           )}
//                         </td>
//                         <td>
//                           <button className="grade-btn" onClick={() => handleGrade(sub)}>
//                             {sub.grade ? "✏️ Regrade" : "⭐ Grade"}
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Grade Modal */}
//       {showGradeModal && (
//         <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>⭐ Grade Submission</h2>
//               <button className="close-modal" onClick={() => setShowGradeModal(false)}>✕</button>
//             </div>
            
//             <form onSubmit={handleSubmitGrade}>
//               <div className="form-group">
//                 <label>Student: <strong>{selectedSubmission?.student_name}</strong></label>
//               </div>
              
//               <div className="form-group">
//                 <label>Grade (out of {selectedAssignment?.max_score || 100})</label>
//                 <input 
//                   type="number" 
//                   step="0.5"
//                   min="0"
//                   max={selectedAssignment?.max_score || 100}
//                   required
//                   value={gradeForm.grade} 
//                   onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
//                   placeholder="Enter grade"
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label>Feedback</label>
//                 <textarea 
//                   rows="4"
//                   value={gradeForm.feedback} 
//                   onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
//                   placeholder="Enter feedback for the student..."
//                 />
//               </div>
              
//               <div className="modal-buttons">
//                 <button type="button" onClick={() => setShowGradeModal(false)}>Cancel</button>
//                 <button type="submit" disabled={submitting}>
//                   {submitting ? "Saving..." : "Submit Grade"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default TeacherAssignment;





import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherAssignment.css";

function TeacherAssignment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "assignment",
    deadline: "",
    weightage: 10,
    max_score: 100,
    late_penalty: 10
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    if (storedUser.userId) {
      fetchCourses(storedUser.userId);
    }
    createFloatingShapes();
  }, []);

  const fetchCourses = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/courses/${teacherId}`);
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAssignments = async (courseCode) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/assignments/${courseCode}?teacherId=${user?.userId}`);
      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/submissions/${user?.userId}/${assignmentId}`);
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDeadlineStatusBadge = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isPassed = now > deadline;
    
    if (assignment.status === 'closed') {
      return <span className="deadline-badge closed">🔒 Closed</span>;
    }
    if (isPassed) {
      return <span className="deadline-badge passed">⏰ Deadline Passed</span>;
    }
    return <span className="deadline-badge active">📝 Active</span>;
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchAssignments(course.course_code);
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({ 
      grade: submission.grade || "", 
      feedback: submission.feedback || "" 
    });
    setShowGradeModal(true);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/grade/${user?.userId}/${selectedSubmission.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: gradeForm.grade,
          feedback: gradeForm.feedback
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Grade submitted successfully!");
        setShowGradeModal(false);
        fetchSubmissions(selectedAssignment.id);
      } else {
        alert(data.error || "Error submitting grade");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting grade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const assignmentData = {
      ...formData,
      course_code: selectedCourse.course_code,
      course_name: selectedCourse.course_name
    };
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/add-assignment/${user?.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Assignment added successfully!");
        setShowAddModal(false);
        fetchAssignments(selectedCourse.course_code);
        setFormData({
          title: "",
          description: "",
          type: "assignment",
          deadline: "",
          weightage: 10,
          max_score: 100,
          late_penalty: 10
        });
      } else {
        alert(data.error || "Error adding assignment");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this assignment?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/delete-assignment/${user?.userId}/${assignmentId}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Assignment deleted successfully!");
        fetchAssignments(selectedCourse.course_code);
      } else {
        alert(data.error || "Error deleting assignment");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting assignment");
    }
  };

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
          <p>Loading your courses...</p>
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

      <main className="teacher-assignment-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/teacher-dashboard')}>← Back to Dashboard</button>
          <h1>Assignment Management</h1>
          <p>Add, edit, delete assignments, and grade student submissions</p>
        </div>

        {/* Courses Section */}
        <div className="courses-section">
          <h2>📚 My Courses</h2>
          {courses.length === 0 ? (
            <div className="no-courses">No courses assigned to you yet.</div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  className={`course-card ${selectedCourse?.id === course.id ? 'active' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="course-code">{course.course_code}</div>
                  <div className="course-name">{course.course_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments Section */}
        {selectedCourse && (
          <div className="assignments-section">
            <div className="section-header">
              <h2>📋 Assignments - {selectedCourse.course_name}</h2>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add New Assignment</button>
            </div>
            
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="no-assignments">
                  <div className="no-data-icon">📭</div>
                  <p>No assignments yet. Click "Add New Assignment" to create one.</p>
                </div>
              ) : (
                <table className="assignments-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Deadline</th>
                      <th>Deadline Status</th>
                      <th>Weightage</th>
                      <th>Submissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td className="assignment-title">{assignment.title}</td>
                        <td>
                          <span className={`type-badge type-${assignment.type}`}>
                            {assignment.type}
                          </span>
                        </td>
                        <td>{new Date(assignment.deadline).toLocaleDateString()}</td>
                        <td>{getDeadlineStatusBadge(assignment)}</td>
                        <td>{assignment.weightage}%</td>
                        <td>
                          <span className="submission-count">
                            {assignment.submission_count || 0} submitted
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-submissions-btn" 
                              onClick={() => handleViewSubmissions(assignment)}
                            >
                              📋 View & Grade Submissions
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New Assignment</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAddAssignment}>
              <div className="form-group">
                <label>Assignment Title *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Data Structures Project"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="4" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the assignment requirements..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Assignment Type *</label>
                  <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="assignment">📝 Assignment</option>
                    <option value="project">🚀 Project</option>
                    <option value="quiz">📊 Quiz</option>
                    <option value="exam">📖 Exam</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Deadline *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={formData.deadline} 
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Weightage (%)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={formData.weightage} 
                    onChange={(e) => setFormData({...formData, weightage: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Late Penalty (%)</label>
                  <input 
                    type="number" 
                    value={formData.late_penalty} 
                    onChange={(e) => setFormData({...formData, late_penalty: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Max Score</label>
                <input 
                  type="number" 
                  value={formData.max_score} 
                  onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                />
              </div>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Submissions & Grading Modal */}
      {showSubmissionsModal && (
        <div className="modal-overlay" onClick={() => setShowSubmissionsModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Submissions - {selectedAssignment?.title}</h2>
              <button className="close-modal" onClick={() => setShowSubmissionsModal(false)}>✕</button>
            </div>
            
            <div className="submissions-list">
              {submissions.length === 0 ? (
                <div className="no-submissions">
                  <div className="no-data-icon">📭</div>
                  <p>No submissions yet for this assignment.</p>
                </div>
              ) : (
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Submission Date</th>
                      <th>File</th>
                      <th>Current Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub.id}>
                        <td>{sub.student_name}</td>
                        <td>{sub.student_id}</td>
                        <td>{new Date(sub.submission_date).toLocaleString()}</td>
                        <td>
                          {sub.file_url && (
                            <a href={`http://localhost:5000${sub.file_url}`} target="_blank" rel="noopener noreferrer" className="download-link">
                              📥 Download File
                            </a>
                          )}
                          {sub.text_submission && (
                            <div className="text-submission-preview">
                              📝 {sub.text_submission.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td>
                          {sub.grade ? (
                            <span className="grade-display">{sub.grade} / {selectedAssignment?.max_score || 100}</span>
                          ) : (
                            <span className="not-graded">Not graded yet</span>
                          )}
                        </td>
                        <td>
                          <button className="grade-btn" onClick={() => handleGrade(sub)}>
                            {sub.grade ? "✏️ Edit Grade" : "⭐ Add Grade"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal - Where teacher enters the grade */}
      {showGradeModal && (
        <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Grade Submission</h2>
              <button className="close-modal" onClick={() => setShowGradeModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitGrade}>
              <div className="form-group">
                <label>Student: <strong>{selectedSubmission?.student_name}</strong></label>
              </div>
              
              <div className="form-group">
                <label>Grade (out of {selectedAssignment?.max_score || 100})</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  max={selectedAssignment?.max_score || 100}
                  required
                  value={gradeForm.grade} 
                  onChange={(e) => setGradeForm({...gradeForm, grade: e.target.value})}
                  placeholder="Enter grade"
                />
                <small>Enter a number between 0 and {selectedAssignment?.max_score || 100}</small>
              </div>
              
              <div className="form-group">
                <label>Feedback (Optional)</label>
                <textarea 
                  rows="4"
                  value={gradeForm.feedback} 
                  onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                  placeholder="Enter feedback for the student..."
                />
              </div>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowGradeModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Submit Grade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherAssignment;