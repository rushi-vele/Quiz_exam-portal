import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Save, Upload, Plus, Trash2, X } from 'lucide-react';

const CreateExam = () => {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 30,
    total_marks: 100,
    passing_marks: 40
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/exams', examData);
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('examId', data.id);
        await API.post('/questions/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      alert('Exam created successfully');
      navigate('/');
    } catch (err) {
      alert('Error creating exam: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page">
      <header className="page-header">
        <h1 className="gradient-text">Create New Exam</h1>
        <p>Set up your exam parameters and import questions from Excel.</p>
      </header>

      <form onSubmit={handleCreate} className="create-exam-form">
        <div className="form-grid">
          <div className="form-left glass">
            <h3>General Settings</h3>
            <div className="input-group">
              <label>Exam Title</label>
              <input 
                type="text" 
                value={examData.title}
                onChange={(e) => setExamData({...examData, title: e.target.value})}
                required 
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                value={examData.description}
                onChange={(e) => setExamData({...examData, description: e.target.value})}
                required 
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Duration (mins)</label>
                <input 
                  type="number" 
                  value={examData.duration}
                  onChange={(e) => setExamData({...examData, duration: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Total Marks</label>
                <input 
                  type="number" 
                  value={examData.total_marks}
                  onChange={(e) => setExamData({...examData, total_marks: e.target.value})}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-right glass">
            <h3>Import Questions</h3>
            <p className="hint">Upload an Excel file (.xlsx) with columns: question_text, question_type, options, correct_answer, points</p>
            
            <div className={`upload-zone ${file ? 'has-file' : ''}`}>
              <Upload size={40} className="upload-icon" />
              <input 
                type="file" 
                accept=".xlsx" 
                onChange={(e) => setFile(e.target.files[0])}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                {file ? file.name : 'Click to select Excel file'}
              </label>
              {file && <button type="button" onClick={() => setFile(null)} className="clear-file"><X size={16} /></button>}
            </div>

            <div className="manual-entry-hint">
              <p>Or use the manual question editor after creation.</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save size={18} />
            <span>{loading ? 'Creating...' : 'Finalize Exam'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
