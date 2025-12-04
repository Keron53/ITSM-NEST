import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2, Clock, User, ArrowRight, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getChangeRequests, deleteChangeRequest, updateChangeRequest } from '../../services/change-request.service';
import { type ChangeRequest, ChangeStatus, ChangePriority, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ChangeRequestList = () => {
    const [changes, setChanges] = useState<ChangeRequest[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadChanges();
    }, []);

    const loadChanges = async () => {
        try {
            const data = await getChangeRequests();
            setChanges(data);
        } catch (error) {
            console.error('Error loading change requests:', error);
        }
    };

    const handleDelete = async (change: ChangeRequest) => {
        if (window.confirm('Are you sure you want to delete this change request?')) {
            try {
                await deleteChangeRequest(change.id);
                loadChanges();
            } catch (error) {
                console.error('Error deleting change request:', error);
            }
        }
    };

    const handleStatusUpdate = async (id: number, status: ChangeStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            try {
                await updateChangeRequest(id, { status });
                loadChanges();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const getStatusColor = (status: ChangeStatus) => {
        switch (status) {
            case ChangeStatus.COMPLETED:
            case ChangeStatus.APPROVED:
                return 'bg-green-50 border-green-200 text-green-900';
            case ChangeStatus.IMPLEMENTATION:
                return 'bg-blue-50 border-blue-200 text-blue-900';
            case ChangeStatus.FAILED:
            case ChangeStatus.REJECTED:
                return 'bg-red-50 border-red-200 text-red-900';
            case ChangeStatus.REQUESTED:
            default:
                return 'bg-amber-50 border-amber-200 text-amber-900';
        }
    };

    const getPriorityColor = (priority: ChangePriority) => {
        switch (priority) {
            case ChangePriority.CRITICAL:
                return 'text-red-600 bg-red-100';
            case ChangePriority.HIGH:
                return 'text-orange-600 bg-orange-100';
            case ChangePriority.MEDIUM:
                return 'text-yellow-600 bg-yellow-100';
            case ChangePriority.LOW:
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const isAgent = user?.role === UserRole.AGENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Change Requests</h2>
                    <p className="text-gray-500 mt-1">Manage and track system changes</p>
                </div>
                <button
                    onClick={() => navigate('/changes/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus size={20} />
                    New Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {changes.map((item) => {
                    const isAssignee = String(item.assignee?.id) === String(user?.id);
                    const isRequester = String(item.requester?.id) === String(user?.id);
                    const isApprover = String(item.approver?.id) === String(user?.id);

                    const isRequested = item.status === ChangeStatus.REQUESTED;
                    const isApproved = item.status === ChangeStatus.APPROVED;
                    const isImplementation = item.status === ChangeStatus.IMPLEMENTATION;

                    const hasAssigneeOrApprover = !!item.assignee || !!item.approver;
                    const canRequesterAction = isRequester && isRequested && !hasAssigneeOrApprover;
                    const canApproverAction = isApprover && isRequested;
                    const canAssigneeStart = isAssignee && isApproved;
                    const canAssigneeFinish = isAssignee && isImplementation;
                    const canEdit = isAdmin || (isAgent && canRequesterAction);
                    const canView = !isAdmin && !canEdit && isAgent;

                    return (
                        <div
                            key={item.id}
                            className={`relative group rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getStatusColor(item.status)}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold opacity-70 uppercase tracking-wider">
                                        #{item.id} • {item.type}
                                    </span>
                                    <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityColor(item.priority)}`}>
                                    {item.priority}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <User size={16} />
                                    <span>Requester: <span className="font-semibold">{item.requester?.name || 'Unknown'}</span></span>
                                </div>
                                {item.assignee && (
                                    <div className="flex items-center gap-2 text-sm opacity-80">
                                        <ArrowRight size={16} />
                                        <span>Assignee: <span className="font-semibold">{item.assignee.name}</span></span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <Clock size={16} />
                                    <span className="uppercase font-bold">{item.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <Calendar size={16} />
                                    <span>Requested: {new Date(item.requestDate).toLocaleDateString()}</span>
                                </div>
                                {item.completedDate && (
                                    <div className="flex items-center gap-2 text-sm opacity-80 text-green-700 font-medium">
                                        <Calendar size={16} />
                                        <span>Completed: {new Date(item.completedDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {item.closureNotes && (
                                    <div className="flex items-start gap-2 text-sm opacity-80 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full">
                                        <FileText size={16} className="mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">Closure Notes</span>
                                            <span className="text-gray-700">{item.closureNotes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Optional: Add a quick action menu or indicator here if needed */}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-black/10">
                                {canApproverAction && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(item.id, ChangeStatus.APPROVED)} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button onClick={() => handleStatusUpdate(item.id, ChangeStatus.REJECTED)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </>
                                )}

                                {canAssigneeStart && (
                                    <button onClick={() => handleStatusUpdate(item.id, ChangeStatus.IMPLEMENTATION)} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                        <CheckCircle size={16} /> Start Implementation
                                    </button>
                                )}

                                {canAssigneeFinish && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(item.id, ChangeStatus.COMPLETED)} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                            <CheckCircle size={16} /> Complete
                                        </button>
                                        <button onClick={() => handleStatusUpdate(item.id, ChangeStatus.FAILED)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                                            <XCircle size={16} /> Fail
                                        </button>
                                    </>
                                )}

                                <div className="flex gap-2 ml-auto">
                                    {canEdit && (
                                        <button onClick={() => navigate(`/changes/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-indigo-700 rounded-lg transition-colors" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                    {canView && (
                                        <button onClick={() => navigate(`/changes/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-blue-700 rounded-lg transition-colors" title="View">
                                            <Eye size={18} />
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => handleDelete(item)} className="p-2 bg-white/50 hover:bg-white text-red-700 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChangeRequestList;
