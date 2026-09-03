CREATE DATABASE IF NOT EXISTS swehub;
USE swehub;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','teacher','admin','cr') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(25) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  credit DECIMAL(3,1) NOT NULL,
  semester VARCHAR(30) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline DATETIME NOT NULL,
  course_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path VARCHAR(255),
  text_submission TEXT,
  grade VARCHAR(5),
  feedback TEXT,
  evaluated_by INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (evaluated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS study_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  course_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  topic VARCHAR(200) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  meeting_link VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  status ENUM('scheduled','cancelled','completed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  grade VARCHAR(5) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  published_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (published_by) REFERENCES users(id)
);

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Student Demo', 'student@swehub.com', '123456', 'student'),
(2, 'Teacher Demo', 'teacher@swehub.com', '123456', 'teacher'),
(3, 'Admin Demo', 'admin@swehub.com', '123456', 'admin'),
(4, 'CR Demo', 'cr@swehub.com', '123456', 'cr');

INSERT IGNORE INTO courses (id, course_code, title, credit, semester, description) VALUES
(1, 'CSE-2101', 'Software Engineering', 3.0, '5th', 'Core software engineering concepts'),
(2, 'CSE-2102', 'Database Management Systems', 3.0, '5th', 'Relational databases and SQL');

DROP DATABASE IF EXISTS swehub;
CREATE DATABASE swehub;
USE swehub;

CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_code VARCHAR(20),
  course_name VARCHAR(100) NOT NULL,
  type ENUM('assignment', 'project', 'quiz', 'exam') DEFAULT 'assignment',
  submission_mode ENUM('individual', 'group') DEFAULT 'individual',
  assigned_date DATE,
  deadline DATETIME NOT NULL,
  weightage DECIMAL(5,2) DEFAULT 0,
  max_score INT DEFAULT 100,
  late_penalty DECIMAL(5,2) DEFAULT 10,
  status ENUM('open', 'closed', 'coming_soon') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE assignment_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(20),
  file_type VARCHAR(50),
  file_url VARCHAR(500),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE TABLE assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(100),
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size VARCHAR(20),
  text_submission TEXT,
  status ENUM('submitted', 'late', 'resubmitted') DEFAULT 'submitted',
  grade DECIMAL(5,2),
  feedback TEXT,
  graded_by VARCHAR(100),
  graded_date TIMESTAMP NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

INSERT INTO assignments (id, title, description, course_code, course_name, type, submission_mode, assigned_date, deadline, weightage, max_score, late_penalty, status) VALUES
(1, 'Graph Data Structure Implementation', 'Implement a comprehensive graph data structure with efficient algorithms for various operations including BFS, DFS, Dijkstra''s algorithm, and minimum spanning tree.', 'CSE 201', 'Data Structures', 'project', 'individual', '2024-12-01', '2026-05-15 23:59:00', 15.00, 100, 10.00, 'open'),
(2, 'Database Normalization Project', 'Design and normalize a database for a library management system. Include all normal forms up to BCNF.', 'CSE 305', 'Database', 'project', 'group', '2024-12-10', '2026-05-10 23:59:00', 20.00, 100, 15.00, 'open'),
(3, 'Operating System Process Scheduling', 'Implement different CPU scheduling algorithms including FCFS, SJF, Round Robin, and Priority Scheduling.', 'CSE 303', 'Operating System', 'assignment', 'individual', '2024-12-15', '2026-05-05 23:59:00', 10.00, 50, 5.00, 'closed'),
(4, 'Artificial Intelligence Research Report', 'Research and write a comprehensive report on recent advancements in Artificial Intelligence and Machine Learning.', 'CSE 401', 'Artificial Intelligence', 'assignment', 'individual', '2024-12-20', '2026-05-20 23:59:00', 12.00, 100, 10.00, 'open');

INSERT INTO assignment_resources (assignment_id, file_name, file_size, file_type, file_url) VALUES
(1, 'Graph Theory Basics.pdf', '2.4 MB', 'application/pdf', '/uploads/graph-theory-basics.pdf'),
(1, 'Sample Implementation.java', '15 KB', 'text/x-java', '/uploads/sample-implementation.java'),
(2, 'Database Design Guidelines.pdf', '1.8 MB', 'application/pdf', '/uploads/db-guidelines.pdf'),
(3, 'Process Scheduling Notes.pdf', '1.2 MB', 'application/pdf', '/uploads/scheduling-notes.pdf'),
(4, 'AI Research Topics.pdf', '950 KB', 'application/pdf', '/uploads/ai-topics.pdf');

INSERT INTO assignment_submissions (assignment_id, student_id, student_name, file_url, file_name, text_submission, status, grade, feedback) VALUES
(2, 'STU001', 'John Doe', '/submissions/db_project.pdf', 'Library_DB_Project.pdf', 'Please find my database design attached.', 'submitted', 85.50, 'Good work! Could improve indexing strategy.'),
(3, 'STU001', 'John Doe', '/submissions/os_assignment.zip', 'Process_Scheduler.zip', 'Implemented all scheduling algorithms.', 'submitted', 92.00, 'Excellent implementation!');

USE swehub;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin', 'cr') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_code VARCHAR(20),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size VARCHAR(20),
  uploaded_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- tryyyy
USE swehub;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin', 'cr') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo accounts
INSERT IGNORE INTO users (id, user_id, name, email, password, role) VALUES
(1, 'STU001', 'Student Demo', 'student@swehub.com', '123456', 'student'),
(2, 'TCH001', 'Teacher Demo', 'teacher@swehub.com', '123456', 'teacher'),
(3, 'ADM001', 'Admin Demo', 'admin@swehub.com', '123456', 'admin'),
(4, 'CR001',  'CR Demo',    'cr@swehub.com',    '123456', 'cr');


USE swehub;

ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

SET SQL_SAFE_UPDATES = 0;

UPDATE users SET is_active = TRUE;

SET SQL_SAFE_UPDATES = 1;

USE swehub;

-- Ensure all necessary columns exist on the users table
USE swehub;

ALTER TABLE users ADD COLUMN batch_id VARCHAR(50);
USE swehub;

DESCRIBE users;

ALTER TABLE swehub.users ADD COLUMN department VARCHAR(100);
ALTER TABLE swehub.users ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;


