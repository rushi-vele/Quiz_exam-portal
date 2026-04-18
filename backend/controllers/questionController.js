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
            return res.status(415).json({ message: 'Unsupported or corrupted file format.' });
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        const ALIASES = {
            question: ['question', 'question_text', 'questiontext', 'text', 'prompt', 'query', 'ques', 'description'],
            type: ['type', 'question_type', 'questiontype', 'kind', 'category'],
            points: ['points', 'marks', 'weight', 'score', 'pts'],
            answer: ['answer', 'correct_answer', 'correctanswer', 'correct', 'solution', 'key', 'correct_option'],
            options: {
                a: ['a', 'option_a', 'optiona', 'opt_a', 'choice_a', 'option1', 'opt1', '1'],
                b: ['b', 'option_b', 'optionb', 'opt_b', 'choice_b', 'option2', 'opt2', '2'],
                c: ['c', 'option_c', 'optionc', 'opt_c', 'choice_c', 'option3', 'opt3', '3'],
                d: ['d', 'option_d', 'optiond', 'opt_d', 'choice_d', 'option4', 'opt4', '4']
            }
        };

        const findValue = (row, aliases) => {
            const keys = Object.keys(row);
            for (const alias of aliases) {
                const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === alias.toLowerCase().replace(/[^a-z0-9]/g, ''));
                if (foundKey) return row[foundKey];
            }
            return null;
        };

        const extractedQuestions = data.map((row, index) => {
            const q_text = findValue(row, ALIASES.question);
            let q_type = String(findValue(row, ALIASES.type) || '').toLowerCase().trim();
            const q_marks = parseInt(findValue(row, ALIASES.points) || 5);
            const raw_correct = String(findValue(row, ALIASES.answer) || '').trim();
            
            const optA = String(findValue(row, ALIASES.options.a) || '').trim();
            const optB = String(findValue(row, ALIASES.options.b) || '').trim();
            const optC = String(findValue(row, ALIASES.options.c) || '').trim();
            const optD = String(findValue(row, ALIASES.options.d) || '').trim();
            
            let options = [optA, optB, optC, optD].filter(Boolean);
            
            // Auto-detect type if missing
            if (!q_type) {
                q_type = options.length >= 2 ? 'mcq' : 'short_answer';
            }

            let error = null;
            let final_correct = raw_correct;

            if (!q_text) {
                error = 'Question text is missing';
            } else if (!raw_correct) {
                error = 'Correct answer is missing';
            } else if (!['mcq', 'short_answer', 'coding'].includes(q_type)) {
                error = `Invalid type "${q_type}". Use: mcq, short_answer, or coding`;
            } else if (q_type === 'mcq') {
                if (options.length < 2) {
                    error = 'MCQ requires at least 2 options';
                } else {
                    // Handle A, B, C, D or 1, 2, 3, 4 mapping
                    const indexMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
                    const upperCorrect = raw_correct.toUpperCase();
                    if (indexMap[upperCorrect] !== undefined && options[indexMap[upperCorrect]]) {
                        final_correct = options[indexMap[upperCorrect]];
                    } else if (!options.map(o => o.toLowerCase()).includes(raw_correct.toLowerCase())) {
                        error = 'Answer must match one of the options or be A, B, C, D';
                    }
                }
            }

            return {
                question_text: q_text,
                question_type: q_type,
                options: q_type === 'mcq' ? options : [],
                correct_answer: final_correct,
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
