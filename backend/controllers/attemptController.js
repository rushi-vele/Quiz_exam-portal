const { client } = require('../config/db');

exports.startAttempt = async (req, res) => {
    try {
        const { examId } = req.body;
        const examRes = await client.execute({ sql: 'SELECT * FROM exams WHERE id = ?', args: [examId] });
        const exam = examRes.rows[0];
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Check for existing completed attempt
        const completedRes = await client.execute({
            sql: "SELECT id FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'completed'",
            args: [req.user.id, examId]
        });
        if (completedRes.rows.length > 0) {
            return res.status(403).json({ message: 'Assessment already completed. Multiple attempts are restricted.' });
        }

        const existingRes = await client.execute({ 
            sql: "SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'ongoing'", 
            args: [req.user.id, examId] 
        });
        let attempt = existingRes.rows[0];

        if (attempt) {
            // Ensure we treat the DB timestamp (UTC) correctly
            const startTime = new Date(attempt.start_time + 'Z').getTime();
            const elapsed = (Date.now() - startTime) / 60000;
            
            if (elapsed <= Number(exam.duration)) {
                // Return the ongoing attempt if not expired
                return res.json({
                    ...attempt,
                    id: Number(attempt.id),
                    user_id: Number(attempt.user_id),
                    exam_id: Number(attempt.exam_id)
                });
            } else {
                // Mark as completed if expired and move on to create a new one
                await client.execute({ 
                    sql: "UPDATE attempts SET status = 'completed', submitted = TRUE WHERE id = ?", 
                    args: [Number(attempt.id)] 
                });
            }
        }

        const result = await client.execute({
            sql: 'INSERT INTO attempts (user_id, exam_id) VALUES (?, ?)',
            args: [req.user.id, examId]
        });
        res.status(201).json({ id: Number(result.lastInsertRowid), exam_id: examId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const cleanCode = (code) => {
    if (!code) return '';
    // Remove comments (# and //)
    let cleaned = code.replace(/#.*$/gm, ''); // Python comments
    cleaned = cleaned.replace(/\/\/.*$/gm, ''); // JS comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ''); // JS Multiline comments
    
    // Normalize spaces and remove empty lines
    return cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .trim();
};


const { internalRunCode } = require('./codeController');

exports.saveAnswer = async (req, res) => {
    try {
        const { attemptId, questionId, answer, language } = req.body;
        
        const qRes = await client.execute({
            sql: 'SELECT * FROM questions WHERE id = ?',
            args: [questionId]
        });
        const question = qRes.rows[0];
        if (!question) return res.status(404).json({ message: 'Question not found' });

        let isCorrect = false;
        let marksObtained = 0;

        if (question.question_type === 'mcq' || question.question_type === 'short_answer') {
            const studentSelection = String(answer).trim().toLowerCase();
            const correctKey = String(question.correct_answer).trim().toLowerCase();
            isCorrect = studentSelection === correctKey;
        } else if (question.question_type === 'coding') {
            let testCases = [];
            try {
                testCases = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
            } catch (e) {
                testCases = [];
            }

            if (Array.isArray(testCases) && testCases.length > 0) {
                console.log(`Question ${questionId}: Evaluating ${testCases.length} Test Cases...`);
                let passedCount = 0;

                for (const testCase of testCases) {
                    const result = await internalRunCode(answer, language || 'javascript', testCase.input || '');
                    
                    const actualOutput = String(result.output || '').trim().toLowerCase();
                    const expectedOutput = String(testCase.output || '').trim().toLowerCase();

                    if (result.success && actualOutput === expectedOutput) {
                        passedCount++;
                    } else {
                        console.log(`Test Case Failed. Expected: "${expectedOutput}", Got: "${actualOutput}"`);
                    }
                }

                if (passedCount === testCases.length) {
                    isCorrect = true;
                    console.log(`Question ${questionId}: All ${testCases.length} Test Cases Passed! ✅`);
                } else {
                    console.log(`Question ${questionId}: Passed ${passedCount}/${testCases.length} Test Cases. ❌`);
                    // Optional: Partial marks? User didn't specify, so only 100% pass gets points.
                }
            } else {
                // Fallback: Use the previous structural/functional compare logic if no test cases defined
                console.log(`Question ${questionId}: No test cases found. Falling back to benchmark comparison.`);
                const cleanedStudent = cleanCode(answer);
                const cleanedExpectation = cleanCode(question.correct_answer);

                if (cleanedStudent === cleanedExpectation) {
                    isCorrect = true;
                } else {
                    const result = await internalRunCode(answer, language || 'javascript', '');
                    const benchmark = await internalRunCode(question.correct_answer, language || 'javascript', '');
                    if (result.success && benchmark.success && result.output === benchmark.output) {
                        isCorrect = true;
                    }
                }
            }
        }

        if (isCorrect === true) {
            marksObtained = question.points;
        }

        await client.execute({
            sql: `INSERT INTO answers (attempt_id, question_id, submitted_answer, is_correct, marks_obtained) 
                  VALUES (?, ?, ?, ?, ?)
                  ON CONFLICT(attempt_id, question_id) 
                  DO UPDATE SET submitted_answer = EXCLUDED.submitted_answer, 
                                is_correct = EXCLUDED.is_correct, 
                                marks_obtained = EXCLUDED.marks_obtained`,
            args: [attemptId, questionId, String(answer), isCorrect, marksObtained]
        });

        let evaluation = null;
        if (question.question_type === 'coding') {
            evaluation = {
                passed: isCorrect,
                passedCount: typeof passedCount !== 'undefined' ? passedCount : (isCorrect ? 1 : 0),
                totalCount: Array.isArray(testCases) && testCases.length > 0 ? testCases.length : 1
            };
        }

        res.json({ 
            success: true, 
            message: 'Answer processed',
            isCorrect,
            evaluation
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const attemptId = req.params.id;
        const attemptRes = await client.execute({ 
            sql: 'SELECT * FROM attempts WHERE id = ? AND user_id = ?', 
            args: [attemptId, req.user.id] 
        });
        const attempt = attemptRes.rows[0];
        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
        if (attempt.status === 'completed') return res.status(400).json({ message: 'Already submitted' });

        const attemptIdNum = Number(attempt.id);

        // Calculate final score
        const scoreRes = await client.execute({
            sql: 'SELECT SUM(marks_obtained) as total_score FROM answers WHERE attempt_id = ?',
            args: [attemptIdNum]
        });
        const finalScore = Number(scoreRes.rows[0].total_score || 0);

        // Fetch exam details for percentage
        const examRes = await client.execute({
            sql: 'SELECT * FROM exams WHERE id = ?',
            args: [attempt.exam_id]
        });
        const exam = examRes.rows[0];
        const totalMarks = Number(exam.total_marks || 100);
        const percentage = (finalScore / totalMarks) * 100;

        // Calculate time taken
        const startTime = new Date(attempt.start_time).getTime();
        const endTime = Date.now();
        const timeTaken = Math.round((endTime - startTime) / 1000); // seconds

        await client.execute({ 
            sql: "UPDATE attempts SET status = 'completed', submitted = TRUE, end_time = CURRENT_TIMESTAMP, score = ?, percentage = ? WHERE id = ?", 
            args: [finalScore, percentage, attemptIdNum] 
        });

        // Add to leaderboard (using upsert logic or just insert)
        await client.execute({
            sql: 'INSERT INTO leaderboard (user_id, exam_id, total_score, percentage, time_taken) VALUES (?, ?, ?, ?, ?)',
            args: [req.user.id, attempt.exam_id, finalScore, percentage, timeTaken]
        });

        res.json({ message: 'Exam submitted successfully', score: finalScore, percentage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
