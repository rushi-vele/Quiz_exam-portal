-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'student')) DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- duration in minutes
    total_marks INTEGER DEFAULT 100,
    passing_marks INTEGER DEFAULT 40,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('mcq', 'coding')) DEFAULT 'mcq',
    options TEXT, -- JSON string for MCQ options
    correct_answer TEXT, -- For MCQ: option index/text, For Coding: expected output or test cases
    points INTEGER DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exam_id INTEGER,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    score INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('ongoing', 'completed')) DEFAULT 'ongoing',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Answers Table (to store student responses for each question in an attempt)
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    question_id INTEGER,
    submitted_answer TEXT,
    is_correct BOOLEAN,
    marks_obtained INTEGER DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Leaderboard Table (View or Table to store final results for quick access)
CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exam_id INTEGER,
    total_score INTEGER,
    rank INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);
