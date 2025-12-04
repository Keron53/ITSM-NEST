import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2, User, ArrowRight, Clock, Calendar, FileText, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProblems, deleteProblem, updateProblem } from '../../services/problems.service';
import { type Problem, ProblemStatus, ProblemPriority, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ProblemList = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            const data = await getProblems();
            setProblems(data);
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    };

    const handleDelete = async (problem: Problem) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await deleteProblem(problem.id);
                loadProblems();
            } catch (error) {
                console.error('Error deleting problem:', error);
            }
        }
    };

    const handleStatusUpdate = async (id: number, status: ProblemStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            try {
                await updateProblem(id, { status });
                loadProblems();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const getStatusColor = (status: ProblemStatus) => {
        switch (status) {
            case ProblemStatus.RESOLVED:
                return 'bg-green-50 border-green-200 text-green-900';
            case ProblemStatus.IN_PROGRESS:
                return 'bg-blue-50 border-blue-200 text-blue-900';
            case ProblemStatus.CANCELED:
                return 'bg-red-50 border-red-200 text-red-900';
            case ProblemStatus.PENDING:
            default:
                return 'bg-amber-50 border-amber-200 text-amber-900';
        }
    };

    const getPriorityColor = (priority: ProblemPriority) => {
        switch (priority) {
            case ProblemPriority.CRITICAL:
                return 'text-red-600 bg-red-100';
            case ProblemPriority.HIGH:
                return 'text-orange-600 bg-orange-100';
            case ProblemPriority.MEDIUM:
                return 'text-yellow-600 bg-yellow-100';
            case ProblemPriority.LOW:
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
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Problems</h2>
                    <p className="text-gray-500 mt-1">Track and resolve recurring issues</p>
                </div>
                <button
                    onClick={() => navigate('/problems/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus size={20} />
                    New Problem
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((item) => {
                    const isAssignee = String(item.assignee?.id) === String(user?.id);
                    const isReporter = String(item.reporter?.id) === String(user?.id);
                    const isUser = user?.role === UserRole.USER;
                    const isPending = item.status === ProblemStatus.PENDING;

                    const canEdit = isAdmin || (((isAgent && isReporter) || (isUser && isReporter)) && isPending);
                    const canView = !isAdmin && !canEdit && (
                        isAgent ||
                        (isUser && item.status !== ProblemStatus.PENDING)
                    );

                    const showActionButtons = isPending || (item.status === ProblemStatus.IN_PROGRESS && isAssignee);

                    return (
                        <div
                            key={item.id}
                            className={`relative group rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getStatusColor(item.status)}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold opacity-70 uppercase tracking-wider">
                                        #{item.id}
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
                                    <span>Reporter: <span className="font-semibold">{item.reporter?.name || 'Unknown'}</span></span>
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
                                    <span>Reported: {new Date(item.reportDate).toLocaleDateString()}</span>
                                </div>
                                {item.resolutionDate && (
                                    <div className="flex items-center gap-2 text-sm opacity-80 text-green-700 font-medium">
                                        <Calendar size={16} />
                                        <span>Resolved: {new Date(item.resolutionDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {item.implementedSolution && (
                                    <div className="flex items-start gap-2 text-sm opacity-80 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100 w-full">
                                        <CheckSquare size={16} className="mt-0.5 shrink-0 text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs uppercase tracking-wide text-blue-600">Solution</span>
                                            <span className="text-gray-700">{item.implementedSolution}</span>
                                        </div>
                                    </div>
                                )}
                                {item.closureNotes && (
                                    <div className="flex items-start gap-2 text-sm opacity-80 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full">
                                        <FileText size={16} className="mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">Closure Notes</span>
                                            <span className="text-gray-700">{item.closureNotes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-black/10">
                                {showActionButtons && (
                                    <>
                                        {((isAgent && isAssignee) || (isUser && isReporter) || (isAgent && isReporter)) && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, ProblemStatus.RESOLVED)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                title="Resolve"
                                            >
                                                <CheckCircle size={16} /> Resolve
                                            </button>
                                        )}

                                        {((isAgent && isAssignee) || (isUser && isReporter) || (isAgent && isReporter)) && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, ProblemStatus.CANCELED)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                title="Cancel"
                                            >
                                                <XCircle size={16} /> Cancel
                                            </button>
                                        )}
                                    </>
                                )}

                                <div className="flex gap-2 ml-auto">
                                    {canEdit && (
                                        <button onClick={() => navigate(`/problems/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-indigo-700 rounded-lg transition-colors" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                    {canView && (
                                        <button onClick={() => navigate(`/problems/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-blue-700 rounded-lg transition-colors" title="View">
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

export default ProblemList;
