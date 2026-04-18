require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const connectDB = async () => {
    try {
        // Simple ping to verify connection
        await client.execute('SELECT 1');
        console.log('Turso Database Connected Successfully');
        await initializeSchema();
    } catch (error) {
        console.error('Error connecting to Turso:', error.message);
        // Don't exit process in dev, maybe it's just missing credentials
    }
};

const initializeSchema = async () => {
    // Basic tables if they don't exist
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            duration INTEGER NOT NULL,
            total_questions INTEGER DEFAULT 0,
            total_marks INTEGER DEFAULT 100,
            passing_marks INTEGER DEFAULT 40,
            published BOOLEAN DEFAULT FALSE,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER,
            question_text TEXT NOT NULL,
            question_type TEXT CHECK(question_type IN ('mcq', 'short_answer', 'coding')) DEFAULT 'mcq',
            options TEXT, -- JSON string
            correct_answer TEXT, 
            points INTEGER DEFAULT 1,
            FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            exam_id INTEGER,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            score INTEGER DEFAULT 0,
            percentage REAL DEFAULT 0,
            submitted BOOLEAN DEFAULT FALSE,
            status TEXT DEFAULT 'ongoing',
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exam_id) REFERENCES exams(id)
        );
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            exam_id INTEGER,
            total_score INTEGER,
            time_taken INTEGER,
            percentage REAL,
            achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, exam_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exam_id) REFERENCES exams(id)
        );
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            attempt_id INTEGER,
            question_id INTEGER,
            submitted_answer TEXT,
            is_correct BOOLEAN,
            marks_obtained INTEGER DEFAULT 0,
            UNIQUE(attempt_id, question_id),
            FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS retake_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            exam_id INTEGER,
            status TEXT DEFAULT 'pending', -- pending, approved, rejected
            reason TEXT,
            admin_response TEXT,
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            reviewed_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (exam_id) REFERENCES exams(id),
            UNIQUE(user_id, exam_id, status)
        );
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient_id INTEGER, -- NULL for "all in role"
            recipient_role TEXT, -- 'student' or 'admin'
            sender_id INTEGER,
            message TEXT NOT NULL,
            type TEXT NOT NULL, -- 'exam_created', 'retake_request'
            exam_id INTEGER,
            is_read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recipient_id) REFERENCES users(id)
        );
    `;
    try {
        await client.batch(schema.split(';').filter(s => s.trim()).map(s => s.trim()), "write");
        
        // Ensure leaderboard columns exist for recent updates
        const alterCommands = [
            "ALTER TABLE leaderboard ADD COLUMN total_score INTEGER",
            "ALTER TABLE leaderboard ADD COLUMN time_taken INTEGER",
            "ALTER TABLE leaderboard ADD COLUMN percentage REAL",
            "ALTER TABLE leaderboard ADD COLUMN achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user_exam ON leaderboard(user_id, exam_id)"
        ];

        for (const cmd of alterCommands) {
            try {
                await client.execute(cmd);
            } catch (e) {
                // Ignore "duplicate column" errors
            }
        }

        console.log('Turso Schema Initialized & Migrated');
    } catch (error) {
        console.error('Error initializing schema:', error.message);
    }
};

module.exports = { client, connectDB };
