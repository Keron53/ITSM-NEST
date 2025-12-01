import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getServiceRequests, deleteServiceRequest } from '../../services/service-request.service';
import { type ServiceRequest, RequestStatus, RequestPriority } from '../../types';

const ServiceRequestList = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const navigate = useNavigate();

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
                onEdit={(item) => navigate(`/requests/${item.id}/edit`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ServiceRequestList;
