import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
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

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Problem },
        { header: 'Title', accessor: 'title' as keyof Problem },
        {
            header: 'Status',
            accessor: (item: Problem) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === ProblemStatus.RESOLVED ? 'bg-green-100 text-green-800' :
                    item.status === ProblemStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                        item.status === ProblemStatus.CANCELED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: (item: Problem) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === ProblemPriority.CRITICAL ? 'bg-red-100 text-red-800' :
                    item.priority === ProblemPriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        item.priority === ProblemPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {item.priority.toUpperCase()}
                </span>
            )
        },
        { header: 'Reporter', accessor: (item: Problem) => item.reporter?.name || 'Unknown' },
    ];

    const isAgent = user?.role === UserRole.AGENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Problems</h2>
                <button
                    onClick={() => navigate('/problems/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Problem
                </button>
            </div>

            <Table
                data={problems}
                columns={columns}
                customActions={(item) => {
                    const isAssignee = item.assignee?.id === user?.id;
                    const isReporter = item.reporter?.id === user?.id;
                    const canEdit = isAdmin || (isAgent && (isReporter || isAssignee));
                    const canView = isAgent && !isReporter && !isAssignee;
                    const showStatusActions = isAgent && isAssignee;

                    return (
                        <div className="flex justify-end gap-2">
                            {showStatusActions && item.status !== ProblemStatus.RESOLVED && item.status !== ProblemStatus.CANCELED && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, ProblemStatus.RESOLVED)}
                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                        title="Resolved"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, ProblemStatus.CANCELED)}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                        title="Canceled"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </>
                            )}

                            {canView && (
                                <button
                                    onClick={() => navigate(`/problems/${item.id}/edit`)}
                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                    title="View"
                                >
                                    <Eye size={18} />
                                </button>
                            )}

                            {canEdit && (
                                <button
                                    onClick={() => navigate(`/problems/${item.id}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default ProblemList;
