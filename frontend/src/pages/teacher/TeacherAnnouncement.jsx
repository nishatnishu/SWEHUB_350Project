import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherAnnouncement.css";

function TeacherAnnouncement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    course_code: "",
    course_name: "",
    batch_id: ""
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    if (storedUser.userId) {
      fetchAnnouncements(storedUser.userId);
    }
    createFloatingShapes();
  }, []);

  const fetchAnnouncements = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/announcements/${teacherId}`);
      const data = await response.json();
      setAnnouncements(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchComments = async (announcementId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/announcements/comments/${announcementId}`);
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleViewComments = async (announcement) => {
    setSelectedAnnouncement(announcement);
    await fetchComments(announcement.id);
    setShowCommentsModal(true);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/announcements/create/${user.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("✅ Announcement posted!");
        setShowCreateModal(false);
        setFormData({ title: "", content: "", course_code: "", course_name: "", batch_id: "" });
        fetchAnnouncements(user.userId);
      } else {
        const data = await response.json();
        alert(data.error || "Error creating announcement");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/teacher/announcements/delete/${announcementId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        alert("✅ Deleted!");
        fetchAnnouncements(user.userId);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting");
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
          <p>Loading...</p>
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
          <div className="logo" onClick={() => navigate('/teacher-dashboard')}>📚 SWEHub - Teacher</div>
          <div className="user-section">
            <span>Welcome, {user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="announcement-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/teacher-dashboard')}>← Back</button>
          <h1>Announcements</h1>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>+ New Announcement</button>
        </div>

        <div className="announcements-list">
          {announcements.length === 0 ? (
            <div className="no-announcements">No announcements yet</div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="announcement-card">
                <div className="announcement-header">
                  <div>
                    <strong>{ann.teacher_name}</strong>
                    <span className="date">{new Date(ann.created_at).toLocaleString()}</span>
                  </div>
                  <div className="button-group">
                    <button className="view-comments-btn" onClick={() => handleViewComments(ann)}>
                      💬 {ann.comments_count || 0} Comments
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteAnnouncement(ann.id)}>🗑️</button>
                  </div>
                </div>
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
                {ann.course_code && <span className="tag">📖 {ann.course_code}</span>}
                <div className="stats">
                  <span>❤️ {ann.likes_count || 0}</span>
                  <span>💬 {ann.comments_count || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Announcement</h2>
            <form onSubmit={handleCreateAnnouncement}>
              <input type="text" placeholder="Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              <textarea rows="5" placeholder="Content" required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
              <input type="text" placeholder="Course Code (optional)" value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value})} />
              <input type="text" placeholder="Batch ID (optional)" value={formData.batch_id} onChange={(e) => setFormData({...formData, batch_id: e.target.value})} />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comments - {selectedAnnouncement?.title}</h2>
              <button className="close-modal" onClick={() => setShowCommentsModal(false)}>✕</button>
            </div>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet on this announcement.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-author">
                      <strong>👤 {comment.student_name}</strong>
                      <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="comment-actions">
              <button className="close-comments-btn" onClick={() => setShowCommentsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherAnnouncement;