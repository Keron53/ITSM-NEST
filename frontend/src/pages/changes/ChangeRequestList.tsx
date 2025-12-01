import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getChangeRequests, deleteChangeRequest } from '../../services/change-request.service';
import { type ChangeRequest, ChangeStatus, ChangeType } from '../../types';

const ChangeRequestList = () => {
    const [changes, setChanges] = useState<ChangeRequest[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadChanges();
    }, []);

    const loadChanges = async () => {
        try {
            const data = await getChangeRequests();
            setChanges(data);
        } catch (error) {
            console.error('Error loading changes:', error);
        }
    };

    const handleDelete = async (change: ChangeRequest) => {
        if (window.confirm('Are you sure you want to delete this change request?')) {
            try {
                await deleteChangeRequest(change.id);
                loadChanges();
            } catch (error) {
                console.error('Error deleting change:', error);
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof ChangeRequest },
        { header: 'Title', accessor: 'title' as keyof ChangeRequest },
        {
            header: 'Status',
            accessor: (item: ChangeRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === ChangeStatus.APPROVED ? 'bg-green-100 text-green-800' :
                    item.status === ChangeStatus.IMPLEMENTATION ? 'bg-blue-100 text-blue-800' :
                        item.status === ChangeStatus.REJECTED || item.status === ChangeStatus.FAILED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Type',
            accessor: (item: ChangeRequest) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.type === ChangeType.EMERGENCY ? 'bg-red-100 text-red-800' :
                    item.type === ChangeType.NORMAL ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {item.type.toUpperCase()}
                </span>
            )
        },
        { header: 'Area', accessor: 'area' as keyof ChangeRequest },
        { header: 'Requester', accessor: (item: ChangeRequest) => item.requester?.name || 'Unknown' },
    ];

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
                onEdit={(item) => navigate(`/changes/${item.id}/edit`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ChangeRequestList;
