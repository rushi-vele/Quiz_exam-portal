require('dotenv').config();
const { client, connectDB } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Connecting to Turso for seeding...');
        await connectDB();
        
        // Clear existing tables
        await client.execute('DELETE FROM questions');
        await client.execute('DELETE FROM exams');
        await client.execute('DELETE FROM users');
        await client.execute('DELETE FROM attempts');
        await client.execute('DELETE FROM answers');
        await client.execute('DELETE FROM leaderboard');

        // Create Admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminRes = await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['Admin User', 'admin@example.com', hashedPassword, 'admin']
        });
        const adminId = adminRes.lastInsertRowid;

        // Create Student
        const studentHashed = await bcrypt.hash('student123', 10);
        await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['Student User', 'student@example.com', studentHashed, 'student']
        });

        // Create an Exam
        const examRes = await client.execute({
            sql: 'INSERT INTO exams (title, description, duration, total_marks, passing_marks, total_questions, published, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: ['Modern Web Architecture', 'Fundamental concepts of scaling modern web applications.', 30, 100, 40, 3, true, adminId]
        });
        const examId = examRes.lastInsertRowid;

        // Add Questions
        const questions = [
            {
                text: 'What does the term "Serverless" mean?',
                type: 'mcq',
                options: JSON.stringify(['No servers involved', 'Servers managed by cloud provider', 'Running code on local machine', 'None of the above']),
                correct: 'Servers managed by cloud provider',
                points: 20
            },
            {
                text: 'Explain the benefits of Microservices.',
                type: 'short_answer',
                options: JSON.stringify([]),
                correct: 'Microservices allow for independent scaling, deployment, and fault isolation.',
                points: 30
            },
            {
                text: 'Write a basic Express.js server that listens on port 3000.',
                type: 'coding',
                options: JSON.stringify([]),
                correct: 'const express = require("express"); const app = express(); app.listen(3000);',
                points: 50
            }
        ];

        for (const q of questions) {
            await client.execute({
                sql: 'INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)',
                args: [examId, q.text, q.type, q.options, q.correct, q.points]
            });
        }

        console.log('✅ Database seeded successfully with Turso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedData();
