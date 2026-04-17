const { client } = require('../config/db');
const xlsx = require('xlsx');

exports.addQuestion = async (req, res) => {
    try {
        const { examId, question_text, question_type, options, correctAnswer, points } = req.body;
        const result = await client.execute({
            sql: 'INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)',
            args: [examId, question_text, question_type, JSON.stringify(options || []), correctAnswer, points || 0]
        });
        res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Question added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.parseExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        if (!workbook || !workbook.SheetNames.length) {
            return res.status(415).json({ message: 'Unsupported or corrupted file format. PDF and other document types are not supported.' });
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        const extractedQuestions = data.map((row, index) => {
            // Normalize row keys for high-tolerance mapping
            const clean = {};
            Object.keys(row).forEach(k => {
                const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                clean[normalizedK] = row[k];
            });

            const q_text = clean.question || clean.questiontext || clean.text || clean.prompt || clean.query;
            const q_type = String(clean.questiontype || clean.type || 'mcq').toLowerCase().trim();
            const q_marks = parseInt(clean.marks || clean.points || 1);
            const raw_correct = String(clean.correctanswer || clean.answer || clean.correct || '').trim();
            
            let options = [];
            let error = null;
            let final_correct = raw_correct;

            // Field mandatory validation
            if (!q_text || !raw_correct || isNaN(q_marks)) {
                error = 'Missing required fields (question/correctAnswer/marks)';
            } else if (!['mcq', 'short_answer', 'coding'].includes(q_type)) {
                error = 'Invalid type. Use: mcq, short_answer, or coding';
            } else if (q_type === 'mcq') {
                options = [
                    String(clean.optiona || clean.a || clean.option1 || '').trim(),
                    String(clean.optionb || clean.b || clean.option2 || '').trim(),
                    String(clean.optionc || clean.c || clean.option3 || '').trim(),
                    String(clean.optiond || clean.d || clean.option4 || '').trim()
                ];
                
                if (options.some(opt => !opt)) {
                    error = 'MCQ requires all 4 options (A-D)';
                } else {
                    const upperCorrect = raw_correct.toUpperCase();
                    const indexMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
                    if (indexMap[upperCorrect] !== undefined) {
                        final_correct = options[indexMap[upperCorrect]];
                    } else if (!options.includes(raw_correct)) {
                        error = 'MCQ correctAnswer must be A, B, C, D or the option text';
                    }
                }
            }

            return {
                question_text: q_text,
                question_type: q_type,
                options: options,
                correct_answer: String(final_correct || ''),
                points: q_marks,
                row_number: index + 2,
                error: error
            };
        });

        res.json(extractedQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.bulkUpload = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const examId = req.body.examId;
        if (!examId) return res.status(400).json({ message: 'examId is required' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const validQuestions = [];
        const errors = [];

        data.forEach((row, index) => {
            const clean = {};
            Object.keys(row).forEach(k => {
                const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                clean[normalizedK] = row[k];
            });

            const q_text = clean.question || clean.questiontext || clean.text;
            const q_type = String(clean.questiontype || clean.type || 'mcq').toLowerCase().trim();
            const q_marks = parseInt(clean.marks || clean.points || 1);
            const raw_correct = String(clean.correctanswer || clean.answer || '').trim();
            
            let options = [];
            let error = null;
            let final_correct = raw_correct;

            if (!q_text || !raw_correct || isNaN(q_marks)) {
                error = 'Row missing required fields';
            } else if (q_type === 'mcq') {
                options = [
                    String(clean.optiona || clean.a || '').trim(), 
                    String(clean.optionb || clean.b || '').trim(), 
                    String(clean.optionc || clean.c || '').trim(), 
                    String(clean.optiond || clean.d || '').trim()
                ];
                const indexMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
                const upperCorrect = raw_correct.toUpperCase();
                if (indexMap[upperCorrect] !== undefined) {
                    final_correct = options[indexMap[upperCorrect]];
                } else if (!options.includes(raw_correct)) {
                    error = 'Invalid MCQ format or answer';
                }
            }

            if (error) {
                errors.push({ row: index + 2, error: error });
                return;
            }

            validQuestions.push({
                sql: 'INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)',
                args: [examId, q_text, q_type, JSON.stringify(options), String(final_correct), q_marks]
            });
        });

        if (validQuestions.length > 0) {
            await client.batch(validQuestions, "write");
        }

        res.status(201).json({
            message: `${validQuestions.length} questions uploaded successfully`,
            total_rows: data.length,
            success_count: validQuestions.length,
            errors: errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.batchAddQuestions = async (req, res) => {
    try {
        const { examId, questions } = req.body;
        const insertBatch = questions.map(q => ({
            sql: 'INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)',
            args: [examId, q.question_text, q.question_type, JSON.stringify(q.options || []), q.correct_answer, q.points || 0]
        }));
        await client.batch(insertBatch, "write");
        res.status(201).json({ message: 'All questions added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getQuestionsByExamId = async (req, res) => {
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM questions WHERE exam_id = ?',
            args: [req.params.examId]
        });
        const questions = result.rows.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
        }));
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { question_text, question_type, options, correct_answer, points } = req.body;
        await client.execute({
            sql: 'UPDATE questions SET question_text = ?, question_type = ?, options = ?, correct_answer = ?, points = ? WHERE id = ?',
            args: [question_text, question_type, JSON.stringify(options || []), correct_answer, points, req.params.id]
        });
        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await client.execute({
            sql: 'DELETE FROM questions WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
