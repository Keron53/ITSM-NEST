import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
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

    const columns = [
        { header: 'ID', accessor: 'id' as keyof ChangeRequest },
        { header: 'Title', accessor: 'title' as keyof ChangeRequest },
        {
            header: 'Status',
            accessor: (item: ChangeRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === ChangeStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    item.status === ChangeStatus.IMPLEMENTATION ? 'bg-blue-100 text-blue-800' :
                        item.status === ChangeStatus.FAILED || item.status === ChangeStatus.REJECTED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: (item: ChangeRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === ChangePriority.CRITICAL ? 'bg-red-100 text-red-800' :
                    item.priority === ChangePriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        item.priority === ChangePriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {item.priority.toUpperCase()}
                </span>
            )
        },
        { header: 'Type', accessor: 'type' as keyof ChangeRequest },
        { header: 'Requester', accessor: (item: ChangeRequest) => item.requester?.name || 'Unknown' },
    ];

    const isAgent = user?.role === UserRole.AGENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Change Requests</h2>
                <button
                    onClick={() => navigate('/changes/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Change Request
                </button>
            </div>

            <Table
                data={changes}
                columns={columns}
                customActions={(item) => {
                    const isAssignee = item.assignee?.id === user?.id;
                    const isRequester = item.requester?.id === user?.id;
                    const canEdit = isAdmin || (isAgent && (isRequester || isAssignee));
                    const canView = isAgent && !isRequester && !isAssignee;
                    const showStatusActions = isAgent && isAssignee;

                    return (
                        <div className="flex justify-end gap-2">
                            {showStatusActions && item.status !== ChangeStatus.COMPLETED && item.status !== ChangeStatus.FAILED && item.status !== ChangeStatus.REJECTED && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, ChangeStatus.COMPLETED)}
                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                        title="Completed"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(item.id, ChangeStatus.FAILED)}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                        title="Failed"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </>
                            )}

                            {canView && (
                                <button
                                    onClick={() => navigate(`/changes/${item.id}/edit`)}
                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                    title="View"
                                >
                                    <Eye size={18} />
                                </button>
                            )}

                            {canEdit && (
                                <button
                                    onClick={() => navigate(`/changes/${item.id}/edit`)}
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

export default ChangeRequestList;
