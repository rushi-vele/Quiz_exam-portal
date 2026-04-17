import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    Edit3,
    Trash2,
    Plus,
    X,
    History, 
    ShieldCheck, 
    ShieldAlert,
    UserPlus,
    Mail,
    Loader2
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';
import API from '../../api/api';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/students');
            setStudents(res.data);
        } catch (err) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (student = null) => {
        if (student) {
            setIsEditing(true);
            setSelectedStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                password: '' // Don't pre-fill password
            });
        } else {
            setIsEditing(false);
            setSelectedStudent(null);
            setFormData({ name: '', email: '', password: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await API.put(`/admin/students/${selectedStudent.id}`, formData);
                toast.success('Student profile updated successfully');
            } else {
                await API.post('/admin/students', formData);
                toast.success('Scholar enrolled successfully');
            }
            setShowModal(false);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this scholar? All academic records will be permanently erased.')) return;
        
        try {
            await API.delete(`/admin/students/${id}`);
            toast.success('Student removed from registry');
            setStudents(students.filter(s => s.id !== id));
        } catch (err) {
            toast.error('Failed to eliminate record');
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Student Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage institutional access and monitor academic standing.</p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                    <UserPlus size={18} /> Enroll New Student
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex items-center gap-6 group hover:border-primary-200 transition-all">
                    <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Total Fellows</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-none">{students.length}</h4>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 opacity-50">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">High Achievers</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-none">-</h4>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 opacity-50">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">At Risk</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-none">-</h4>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 opacity-50">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <History size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Active Now</p>
                        <h4 className="text-2xl font-black text-slate-900 leading-none">-</h4>
                    </div>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
                <div className="p-8 bg-white border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Filter by name or identity..." 
                            className="w-full bg-slate-50/50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={fetchStudents}>Refresh Catalog</Button>
                    </div>
                </div>

                <div className="overflow-x-auto min-w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="animate-spin text-primary-600" size={48} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Registry...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/40 border-y border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Personality</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Node</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Load</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredStudents.map((st) => (
                                    <tr key={st.id} className="hover:bg-slate-50/70 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 border border-slate-200 uppercase text-lg">
                                                    {st.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-black text-slate-900 leading-tight">{st.name}</h5>
                                                    <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">Fellow</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-primary-600 transition-colors">
                                                <Mail size={16} className="text-slate-300 group-hover:text-primary-400" />
                                                <span className="text-sm font-semibold">{st.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-900">{st.enrolledCount}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exams Taken</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-bold text-slate-600">{new Date(st.created_at).toLocaleDateString()}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment Date</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => handleOpenModal(st)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:shadow-lg transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(st.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Creation/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[32px] shadow-3xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                        <div className="px-10 py-8 bg-[#0F172A] text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">{isEditing ? 'Update Profile' : 'Student Enrollment'}</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
                                    {isEditing ? `Modifying record for ID-${selectedStudent?.id}` : 'Create a new institutional learner identity.'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white border border-white/10">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-3.5 px-6 text-sm font-semibold transition-all outline-none"
                                    placeholder="e.g. Alexander Scholar"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-3.5 px-6 text-sm font-semibold transition-all outline-none"
                                    placeholder="name@institution.edu"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {isEditing ? 'Security Passphrase (Optional)' : 'Security Passphrase'}
                                </label>
                                <input 
                                    type="password" 
                                    required={!isEditing}
                                    className="w-full bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-primary-500 rounded-2xl py-3.5 px-6 text-sm font-semibold transition-all outline-none"
                                    placeholder={isEditing ? "Leave blank to maintain current" : "Min. 8 characters"}
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="primary" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-600/30">
                                    {isEditing ? 'Confirm Updates' : 'Initialize Enrollment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
