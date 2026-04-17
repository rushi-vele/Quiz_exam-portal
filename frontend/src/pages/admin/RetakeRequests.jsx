import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { Card, Button } from '../../components/common';
import { toast } from 'react-hot-toast';
import { 
    RotateCcw, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    User, 
    BookOpen,
    MessageSquare
} from 'lucide-react';

const RetakeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await API.get('/retake/all');
            setRequests(res.data);
        } catch (err) {
            toast.error('Failed to load retake requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleProcess = async (id, status) => {
        try {
            const response = status === 'approved' ? 'Request approved. Attempt reset.' : 'Request declined.';
            await API.put(`/retake/${id}`, { status, admin_response: response });
            toast.success(`Request ${status} successfully`);
            fetchRequests();
        } catch (err) {
            toast.error('Failed to update request');
        }
    };

    if (isLoading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Requests...</div>;

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        Retake <span className="text-primary-600">Permissions</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and manage student requests for assessment re-attempts.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Review</p>
                        <p className="text-xl font-black text-slate-900">{pendingCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {requests.length === 0 && (
                    <div className="py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                        <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No retake requests found in queue.</p>
                    </div>
                )}

                {requests.map(req => (
                    <Card key={req.id} className={`border-none ring-1 transition-all ${req.status === 'pending' ? 'ring-primary-100 bg-white' : 'ring-slate-100 bg-slate-50/50'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                                        {req.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-sm leading-tight">{req.student_name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{req.student_email}</p>
                                    </div>
                                </div>

                                <div className="h-10 w-px bg-slate-100 hidden md:block"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</p>
                                        <h4 className="font-bold text-slate-800 text-xs">{req.exam_title}</h4>
                                    </div>
                                </div>

                                <div className="h-10 w-px bg-slate-100 hidden md:block"></div>

                                <div className="flex-1 max-w-md">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare size={14} className="text-slate-300 mt-1 shrink-0" />
                                        <p className="text-xs font-medium text-slate-500 italic">"{req.reason || 'No reason specified'}"</p>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">Requested {new Date(req.requested_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {req.status === 'pending' ? (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            className="border-red-100 text-red-600 hover:bg-red-50 px-6"
                                            onClick={() => handleProcess(req.id, 'rejected')}
                                        >
                                            <XCircle size={16} className="mr-2" /> Decline
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            className="bg-emerald-500 hover:bg-emerald-600 border-none px-8"
                                            onClick={() => handleProcess(req.id, 'approved')}
                                        >
                                            <CheckCircle2 size={16} className="mr-2" /> Approve Retake
                                        </Button>
                                    </>
                                ) : (
                                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                        {req.status === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RetakeRequests;
