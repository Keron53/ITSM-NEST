import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/Card';
import { getIncidents } from '../services/incidents.service';
import { getProblems } from '../services/problems.service';
import { getServiceRequests } from '../services/service-request.service';

const Dashboard = () => {
    const [stats, setStats] = useState({
        incidents: 0,
        problems: 0,
        requests: 0,
        pending: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [incidents, problems, requests] = await Promise.all([
                    getIncidents(),
                    getProblems(),
                    getServiceRequests(),
                ]);

                setStats({
                    incidents: incidents.length,
                    problems: problems.length,
                    requests: requests.length,
                    pending: incidents.filter(i => i.status === 'pending').length + requests.filter(r => r.status === 'pending').length,
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="Total Incidents"
                    value={stats.incidents}
                    icon={AlertCircle}
                    color="red"
                    trend="+12%"
                    trendUp={false}
                />
                <Card
                    title="Active Problems"
                    value={stats.problems}
                    icon={AlertTriangle}
                    color="orange"
                />
                <Card
                    title="Service Requests"
                    value={stats.requests}
                    icon={CheckCircle}
                    color="blue"
                    trend="+5%"
                    trendUp={true}
                />
                <Card
                    title="Pending Actions"
                    value={stats.pending}
                    icon={Clock}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm">No recent activity to display.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Database</span>
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">API Gateway</span>
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Email Service</span>
                            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Degraded</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
