import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Timer from '../components/Timer';
import MonacoEditor from '@monaco-editor/react';
import { ChevronLeft, ChevronRight, CheckCircle, Send } from 'lucide-react';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchExamData = useCallback(async () => {
    try {
      const [examRes, questionsRes, attemptRes] = await Promise.all([
        API.get(`/exams/${examId}`),
        API.get(`/questions/exam/${examId}`),
        API.post('/attempts/start', { exam_id: examId })
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setAttemptId(attemptRes.data.id);
    } catch (err) {
      console.error('Error fetching exam data', err);
      alert('Failed to load exam. Please try again.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [examId, navigate]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  const handleAnswerChange = (answer) => {
    setAnswers({ ...answers, [questions[currentIdx].id]: answer });
    // Save to server immediately (debounce could be added for production)
    API.post('/attempts/submit-answer', {
      attempt_id: attemptId,
      question_id: questions[currentIdx].id,
      submitted_answer: answer
    });
  };

  const finishExam = async () => {
    if (window.confirm('Do you want to submit your exam now?')) {
      try {
        await API.post(`/attempts/finish/${attemptId}`);
        alert('Exam submitted successfully!');
        navigate('/results');
      } catch (err) {
        alert('Failed to submit exam');
      }
    }
  };

  const onTimeUp = () => {
    alert('Time is up! Your exam will be submitted automatically.');
    API.post(`/attempts/finish/${attemptId}`).then(() => navigate('/results'));
  };

  if (loading) return <div className="loading-full glass">Initializing exam environment...</div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="exam-session-page">
      <nav className="exam-nav glass">
        <div className="exam-info">
          <h2>{exam?.title}</h2>
          <p>Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className="exam-status">
          <Timer duration={exam?.duration * 60} onTimeUp={onTimeUp} />
          <button onClick={finishExam} className="btn-primary submit-exam-btn">
            <Send size={18} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </nav>

      <div className="exam-body">
        <div className="question-container glass">
          <div className="question-header">
            <span className="q-badge">Question {currentIdx + 1}</span>
            <span className="q-points">{currentQuestion?.points} Points</span>
          </div>
          <div className="question-text">
            {currentQuestion?.question_text}
          </div>

          <div className="answer-section">
            {currentQuestion?.question_type === 'mcq' ? (
              <div className="mcq-options">
                {currentQuestion.options.map((option, idx) => (
                  <label key={idx} className={`option-label glass ${answers[currentQuestion.id] === option ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name={`q-${currentQuestion.id}`} 
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="code-editor-container">
                <MonacoEditor
                  height="400px"
                  language="javascript"
                  theme="vs-dark"
                  value={answers[currentQuestion.id] || '// Write your code here...'}
                  onChange={handleAnswerChange}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
              </div>
            )}
          </div>
        </div>

        <aside className="question-nav glass">
          <h3>Question Navigator</h3>
          <div className="q-grid">
            {questions.map((_, idx) => (
              <button 
                key={idx}
                className={`q-nav-btn ${currentIdx === idx ? 'current' : ''} ${answers[questions[idx].id] ? 'answered' : ''}`}
                onClick={() => setCurrentIdx(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <footer className="exam-footer">
        <button 
          disabled={currentIdx === 0} 
          onClick={() => setCurrentIdx(currentIdx - 1)}
          className="btn-secondary"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <button 
          disabled={currentIdx === questions.length - 1} 
          onClick={() => setCurrentIdx(currentIdx + 1)}
          className="btn-secondary"
        >
          Next <ChevronRight size={20} />
        </button>
      </footer>
    </div>
  );
};

export default ExamPage;
