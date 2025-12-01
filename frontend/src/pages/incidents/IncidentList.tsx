import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getIncidents, deleteIncident } from '../../services/incidents.service';
import { type Incident, IncidentStatus, IncidentPriority } from '../../types';

const IncidentList = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const navigate = useNavigate();

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
                onEdit={(item) => navigate(`/incidents/${item.id}/edit`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default IncidentList;
