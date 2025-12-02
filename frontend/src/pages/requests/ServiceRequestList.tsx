import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getServiceRequests, deleteServiceRequest, updateServiceRequest } from '../../services/service-request.service';
import { type ServiceRequest, RequestStatus, RequestPriority, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ServiceRequestList = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getServiceRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading service requests:', error);
        }
    };

    const handleDelete = async (request: ServiceRequest) => {
        if (window.confirm('Are you sure you want to delete this service request?')) {
            try {
                await deleteServiceRequest(request.id);
                loadRequests();
            } catch (error) {
                console.error('Error deleting request:', error);
            }
        }
    };

    const handleStatusUpdate = async (id: number, status: RequestStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            try {
                await updateServiceRequest(id, { status });
                loadRequests();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof ServiceRequest },
        { header: 'Title', accessor: 'title' as keyof ServiceRequest },
        {
            header: 'Status',
            accessor: (item: ServiceRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === RequestStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                    item.status === RequestStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                        item.status === RequestStatus.CANCELED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: (item: ServiceRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === RequestPriority.CRITICAL ? 'bg-red-100 text-red-800' :
                    item.priority === RequestPriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        item.priority === RequestPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {item.priority.toUpperCase()}
                </span>
            )
        },
        { header: 'Origin Area', accessor: 'originArea' as keyof ServiceRequest },
        { header: 'Requester', accessor: (item: ServiceRequest) => item.requester?.name || 'Unknown' },
    ];

    const isAgent = user?.role === UserRole.AGENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Service Requests</h2>
                <button
                    onClick={() => navigate('/requests/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Service Request
                </button>
            </div>

            <Table
                data={requests}
                columns={columns}
                customActions={(item) => {
                    const isAssignee = String(item.receiver?.id) === String(user?.id);
                    const isRequester = String(item.requester?.id) === String(user?.id);
                    const isUser = user?.role === UserRole.USER;
                    const isPending = item.status === RequestStatus.PENDING;

                    // Permissions
                    // Edit: 
                    // - Admin: Always
                    // - User: If Requester and Pending
                    // - Agent: If Requester and Pending. (Agent Receiver cannot edit fields, only status)
                    const canEdit = isAdmin || (((isAgent && isRequester) || (isUser && isRequester)) && isPending);

                    // View:
                    // - If NOT pending (everyone)
                    // - If Agent Receiver (always, since they can't edit fields)
                    // Admin nunca ve el botón de vista
                    const canView = !isAdmin && !canEdit && (
                        isAgent ||
                        (isUser && item.status !== RequestStatus.PENDING)
                    );

                    const showActionButtons = isPending || (item.status === RequestStatus.IN_PROGRESS && isAssignee);

                    return (
                        <div className="flex justify-end gap-2">
                            {showActionButtons && (
                                <>
                                    {/* Completed Button - Only for Assignee (Agent) */}
                                    {isAgent && (isAssignee || isRequester) && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, RequestStatus.COMPLETED)}
                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                            title="Mark as Completed"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {/* Mark as Completed Button - For User (Requester) */}
                                    {isUser && isRequester && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, RequestStatus.COMPLETED)}
                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                            title="Mark as Completed"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {/* Cancel Button - For Assignee or Requester */}
                                    {((isAgent && isAssignee) || (isUser && isRequester) || (isAgent && isRequester)) && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, RequestStatus.CANCELED)}
                                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                            title="Cancel"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}


                                </>
                            )}

                            {/* Edit Button - Moved outside isPending so Admin can edit anytime */}
                            {canEdit && (
                                <button
                                    onClick={() => navigate(`/requests/${item.id}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}

                            {/* View Button - Show if canView is true */}
                            {canView && (
                                <button
                                    onClick={() => navigate(`/requests/${item.id}/edit`)}
                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                    title="View"
                                >
                                    <Eye size={18} />
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

export default ServiceRequestList;
