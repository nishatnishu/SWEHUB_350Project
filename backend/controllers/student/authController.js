const db = require("../../config/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'swehub_secret_key_2024';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register new user - STORES DATA IN DATABASE
const register = async (req, res) => {
  const { userId, email, password, name, role, department, batchId } = req.body;

  console.log("Registration attempt:", { userId, email, name, role });

  // Validation
  if (!userId || !email || !password || !name || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  // Validate ID format based on role
  const idPrefixes = { student: 'STU', teacher: 'TCH', admin: 'ADM' };
  if (!userId.startsWith(idPrefixes[role])) {
    return res.status(400).json({ error: `${role} ID must start with ${idPrefixes[role]}` });
  }

  // Check if email already exists in database
  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, emailResult) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (emailResult.length > 0) {
      return res.status(400).json({ error: "Email already registered. Please use a different email or login." });
    }

    // Check if user ID already exists in database
    db.query("SELECT id FROM users WHERE user_id = ?", [userId], async (err, idResult) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      if (idResult.length > 0) {
        return res.status(400).json({ error: "User ID already exists. Please choose a different ID." });
      }

      // Hash password and INSERT new user into database
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = `INSERT INTO users (user_id, email, password, name, role, department, batch_id, is_verified, is_active)
                         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)`;

      db.query(insertSql, [userId, email, hashedPassword, name, role, department || null, batchId || null], (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: "Error creating user" });
        }

        console.log("User registered successfully:", userId);
        res.json({ 
          success: true, 
          message: "Account created successfully! Please login." 
        });
      });
    });
  });
};

// Login user - CHECKS DATABASE FOR EXISTING USER
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", { email });

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  // Query database for user with this email
  db.query("SELECT * FROM users WHERE email = ? AND is_active = TRUE", [email], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.status(401).json({ error: "No account found with this email. Please register first." });
    }

    const user = result[0];
    
    // Compare entered password with stored hashed password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid password. Please try again." });
    }

    // Update last login time
    db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        userId: user.user_id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Remove password before sending response
    delete user.password;

    // Determine redirect URL based on role
    let redirectUrl = '/login';
    switch (user.role) {
      case 'student': redirectUrl = '/dashboard'; break;
      case 'teacher': redirectUrl = '/teacher-dashboard'; break;
      case 'admin': redirectUrl = '/admin-dashboard'; break;
    }

    console.log("User logged in:", user.email, "Role:", user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batchId: user.batch_id
      },
      redirectUrl
    });
  });
};

// Check if email exists (for real-time validation during registration)
const checkEmail = (req, res) => {
  const { email } = req.params;
  
  if (!email || !isValidEmail(email)) {
    return res.json({ exists: false, valid: false });
  }
  
  db.query("SELECT id, email FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      return res.json({ exists: false, valid: true });
    }
    
    res.json({
      exists: result.length > 0,
      valid: true,
      message: result.length > 0 ? "Email already registered" : "Email available"
    });
  });
};

module.exports = { register, login, checkEmail };