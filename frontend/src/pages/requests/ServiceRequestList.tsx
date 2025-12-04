import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2, User, ArrowRight, Clock, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

    const getStatusColor = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.COMPLETED:
                return 'bg-green-50 border-green-200 text-green-900';
            case RequestStatus.IN_PROGRESS:
                return 'bg-blue-50 border-blue-200 text-blue-900';
            case RequestStatus.CANCELED:
                return 'bg-red-50 border-red-200 text-red-900';
            case RequestStatus.PENDING:
            default:
                return 'bg-amber-50 border-amber-200 text-amber-900';
        }
    };

    const getPriorityColor = (priority: RequestPriority) => {
        switch (priority) {
            case RequestPriority.CRITICAL:
                return 'text-red-600 bg-red-100';
            case RequestPriority.HIGH:
                return 'text-orange-600 bg-orange-100';
            case RequestPriority.MEDIUM:
                return 'text-yellow-600 bg-yellow-100';
            case RequestPriority.LOW:
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
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Service Requests</h2>
                    <p className="text-gray-500 mt-1">Manage service requests and fulfillments</p>
                </div>
                <button
                    onClick={() => navigate('/requests/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus size={20} />
                    New Service Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((item) => {
                    const isAssignee = String(item.receiver?.id) === String(user?.id);
                    const isRequester = String(item.requester?.id) === String(user?.id);
                    const isUser = user?.role === UserRole.USER;
                    const isPending = item.status === RequestStatus.PENDING;

                    const canEdit = isAdmin || (((isAgent && isRequester) || (isUser && isRequester)) && isPending);
                    const canView = !isAdmin && !canEdit && (
                        isAgent ||
                        (isUser && item.status !== RequestStatus.PENDING)
                    );

                    const showActionButtons = isPending || (item.status === RequestStatus.IN_PROGRESS && isAssignee);

                    return (
                        <div
                            key={item.id}
                            className={`relative group rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${getStatusColor(item.status)}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold opacity-70 uppercase tracking-wider">
                                        #{item.id} • {item.originArea}
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
                                {item.receiver && (
                                    <div className="flex items-center gap-2 text-sm opacity-80">
                                        <ArrowRight size={16} />
                                        <span>Receiver: <span className="font-semibold">{item.receiver.name}</span></span>
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
                                {item.postComments && (
                                    <div className="flex items-start gap-2 text-sm opacity-80 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full">
                                        <FileText size={16} className="mt-0.5 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">Closure Notes</span>
                                            <span className="text-gray-700">{item.postComments}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-black/10">
                                {showActionButtons && (
                                    <>
                                        {isAgent && (isAssignee || isRequester) && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, RequestStatus.COMPLETED)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                title="Mark as Completed"
                                            >
                                                <CheckCircle size={16} /> Complete
                                            </button>
                                        )}

                                        {isUser && isRequester && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, RequestStatus.COMPLETED)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                title="Mark as Completed"
                                            >
                                                <CheckCircle size={16} /> Complete
                                            </button>
                                        )}

                                        {((isAgent && isAssignee) || (isUser && isRequester) || (isAgent && isRequester)) && (
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, RequestStatus.CANCELED)}
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
                                        <button onClick={() => navigate(`/requests/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-indigo-700 rounded-lg transition-colors" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                    {canView && (
                                        <button onClick={() => navigate(`/requests/${item.id}/edit`)} className="p-2 bg-white/50 hover:bg-white text-blue-700 rounded-lg transition-colors" title="View">
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

export default ServiceRequestList;
