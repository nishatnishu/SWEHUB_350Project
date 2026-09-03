import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    userId: "", email: "", password: "", confirmPassword: "",
    name: "", role: "student", department: "", batchId: ""
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "student") navigate("/student-dashboard");
      else if (user.role === "teacher") navigate("/teacher-dashboard");
      else if (user.role === "admin") navigate("/admin-dashboard");
    }
    createFloatingShapes();
  }, []);

  // Real-time email availability check during registration
  useEffect(() => {
    if (!isLogin && registerData.email && registerData.email.includes('@')) {
      const timeout = setTimeout(() => checkEmailAvailability(registerData.email), 500);
      return () => clearTimeout(timeout);
    }
  }, [registerData.email, isLogin]);

  const checkEmailAvailability = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/check-email/${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailAvailable(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.redirectUrl);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (emailAvailable?.exists) {
      setError("Email already registered");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: registerData.userId,
          email: registerData.email,
          password: registerData.password,
          name: registerData.name,
          role: registerData.role,
          department: registerData.department,
          batchId: registerData.batchId
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration successful! Please login.");
        setIsLogin(true);
        setLoginData({ email: registerData.email, password: "" });
        setRegisterData({
          userId: "", email: "", password: "", confirmPassword: "",
          name: "", role: "student", department: "", batchId: ""
        });
        setEmailAvailable(null);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <>
      <div className="background"></div>
      <div className="floating-shapes" id="floatingShapes"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-section">
            <div className="logo-icon">🎓</div>
            <h1>SWE<span>Hub</span></h1>
            <p>Software Engineering Hub</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`tab-btn ${isLogin ? 'active' : ''}`} 
              onClick={() => { setIsLogin(true); setError(""); setEmailAvailable(null); }}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${!isLogin ? 'active' : ''}`} 
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Register
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required 
                  value={loginData.email} 
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})} 
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginData.password} 
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
                  placeholder="••••••"
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>ID Number *</label>
                  <input 
                    type="text" 
                    required 
                    value={registerData.userId} 
                    onChange={(e) => setRegisterData({...registerData, userId: e.target.value})} 
                    placeholder="STU001 / TCH001 / ADM001"
                  />
                  <small>Student: STUxxxx, Teacher: TCHxxxx, Admin: ADMxxxx</small>
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select 
                    required 
                    value={registerData.role} 
                    onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={registerData.name} 
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  required 
                  value={registerData.email} 
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
                  placeholder="your@email.com"
                />
                {emailAvailable && (
                  <small className={emailAvailable.exists ? "error-text" : "success-text"}>
                    {emailAvailable.exists ? "❌ Email already registered" : "✓ Email available"}
                  </small>
                )}
              </div>

              {registerData.role === "student" && (
                <div className="form-group">
                  <label>Batch ID (Optional)</label>
                  <input 
                    type="text" 
                    value={registerData.batchId} 
                    onChange={(e) => setRegisterData({...registerData, batchId: e.target.value})} 
                    placeholder="1, 2, or 3"
                  />
                </div>
              )}

              {registerData.role === "teacher" && (
                <div className="form-group">
                  <label>Department (Optional)</label>
                  <input 
                    type="text" 
                    value={registerData.department} 
                    onChange={(e) => setRegisterData({...registerData, department: e.target.value})} 
                    placeholder="e.g., Computer Science"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={registerData.password} 
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input 
                    type="password" 
                    required 
                    value={registerData.confirmPassword} 
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} 
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;