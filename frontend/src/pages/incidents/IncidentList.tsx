import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getIncidents, deleteIncident, updateIncident } from '../../services/incidents.service';
import { type Incident, IncidentStatus, IncidentPriority, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const IncidentList = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            const data = await getIncidents();
            setIncidents(data);
        } catch (error) {
            console.error('Error loading incidents:', error);
        }
    };

    const handleDelete = async (incident: Incident) => {
        if (window.confirm('Are you sure you want to delete this incident?')) {
            try {
                await deleteIncident(incident.id);
                loadIncidents();
            } catch (error) {
                console.error('Error deleting incident:', error);
            }
        }
    };

    const handleStatusUpdate = async (id: number, status: IncidentStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            try {
                await updateIncident(id, { status });
                loadIncidents();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Incident },
        { header: 'Title', accessor: 'title' as keyof Incident },
        {
            header: 'Status',
            accessor: (item: Incident) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-800' :
                    item.status === IncidentStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                        item.status === IncidentStatus.CANCELED ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Priority',
            accessor: (item: Incident) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.priority === IncidentPriority.CRITICAL ? 'bg-red-100 text-red-800' :
                    item.priority === IncidentPriority.HIGH ? 'bg-orange-100 text-orange-800' :
                        item.priority === IncidentPriority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {item.priority.toUpperCase()}
                </span>
            )
        },
        { header: 'Category', accessor: 'category' as keyof Incident },
        { header: 'Reporter', accessor: (item: Incident) => item.reporter?.name || 'Unknown' },
    ];

    const isAgent = user?.role === UserRole.AGENT;
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Incidents</h2>
                <button
                    onClick={() => navigate('/incidents/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Incident
                </button>
            </div>

            <Table
                data={incidents}
                columns={columns}
                customActions={(item) => {
                    const isAssignee = String(item.assignee?.id) === String(user?.id);
                    const isReporter = String(item.reporter?.id) === String(user?.id);
                    const isUser = user?.role === UserRole.USER;
                    const isPending = item.status === IncidentStatus.PENDING;

                    // Permissions
                    // Edit:
                    // - Admin: Always
                    // - User: If Reporter and Pending
                    // - Agent: If Reporter and Pending. (Agent Assignee cannot edit fields, only status)
                    const canEdit = isAdmin || (((isAgent && isReporter) || (isUser && isReporter)) && isPending);

                    // View:
                    // - If NOT pending (everyone)
                    // - If Agent Assignee (always, since they can't edit fields)
                    // Admin nunca ve el botón de vista
                    const canView = !isAdmin && !canEdit && (
                        isAgent ||
                        (isUser && item.status !== IncidentStatus.PENDING)
                    );

                    const showActionButtons = isPending || (item.status === IncidentStatus.IN_PROGRESS && isAssignee);

                    return (
                        <div className="flex justify-end gap-2">
                            {showActionButtons && (
                                <>
                                    {/* Resolve Button - For Assignee (Agent) or Reporter (User/Agent) */}
                                    {((isAgent && isAssignee) || (isUser && isReporter) || (isAgent && isReporter)) && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, IncidentStatus.RESOLVED)}
                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                                            title="Resolve"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {/* Cancel Button - For Assignee or Reporter */}
                                    {((isAgent && isAssignee) || (isUser && isReporter) || (isAgent && isReporter)) && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, IncidentStatus.CANCELED)}
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
                                    onClick={() => navigate(`/incidents/${item.id}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}

                            {/* View Button - Show if canView is true */}
                            {canView && (
                                <button
                                    onClick={() => navigate(`/incidents/${item.id}/edit`)}
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

export default IncidentList;
