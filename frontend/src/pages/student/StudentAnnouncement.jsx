import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentAnnouncement.css";

function StudentAnnouncement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    if (storedUser.userId) {
      loadAnnouncements(storedUser);
    }
    createFloatingShapes();
  }, []);

  const loadAnnouncements = async (userData) => {
    try {
      let url = `http://localhost:5000/api/student/announcements/${userData.userId}`;
      if (userData.batchId) {
        url += `?batchId=${userData.batchId}`;
      }
      const response = await fetch(url);
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
      const response = await fetch(`http://localhost:5000/api/student/announcements/comments/${announcementId}`);
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (post) => {
    setSelectedPost(post);
    await fetchComments(post.id);
    setShowCommentsModal(true);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/student/announcements/comment/${selectedPost.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.userId,
          student_name: user.name,
          comment: newComment
        })
      });
      
      if (response.ok) {
        setNewComment("");
        await fetchComments(selectedPost.id);
        setAnnouncements(prev => prev.map(p => 
          p.id === selectedPost.id ? {...p, comments_count: (p.comments_count || 0) + 1} : p
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/announcements/like/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.userId,
          user_role: "student"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(prev => prev.map(p => 
          p.id === postId 
            ? {...p, likes_count: data.liked ? (p.likes_count || 0) + 1 : (p.likes_count || 0) - 1, user_liked: data.liked ? 1 : 0}
            : p
        ));
      }
    } catch (err) {
      console.error(err);
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
          <p>Loading announcements...</p>
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

      <header className="student-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/dashboard')}>🎓 SWEHub</div>
          <div className="user-section">
            <span>Welcome, {user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="announcement-feed">
        <div className="feed-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
          <h1>Announcements</h1>
        </div>

        <div className="posts-container">
          {announcements.length === 0 ? (
            <div className="no-posts">No announcements yet</div>
          ) : (
            announcements.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="author-name">{post.teacher_name}</div>
                  <div className="post-date">{new Date(post.created_at).toLocaleString()}</div>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
                {post.course_code && <span className="course-badge">📖 {post.course_code}</span>}
                <div className="post-actions">
                  <button className={`like-btn ${post.user_liked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                    ❤️ {post.likes_count || 0}
                  </button>
                  <button className="comment-btn" onClick={() => handleComment(post)}>
                    💬 {post.comments_count || 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comments</h2>
              <button className="close-modal" onClick={() => setShowCommentsModal(false)}>✕</button>
            </div>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p>No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <strong>{comment.student_name}</strong>
                    <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                    <p>{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="comment-input-area">
              <textarea rows="3" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button onClick={submitComment}>Post Comment</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentAnnouncement;