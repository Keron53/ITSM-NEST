import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Activity, ArrowUpRight, Server, Database, Shield } from 'lucide-react';
import { getIncidents } from '../services/incidents.service';
import { getProblems } from '../services/problems.service';
import { getServiceRequests } from '../services/service-request.service';
import { getChangeRequests } from '../services/change-request.service';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    incidents: number;
    problems: number;
    requests: number;
    changes: number;
    pending: number;
}

interface RecentActivity {
    id: number;
    title: string;
    type: 'incident' | 'problem' | 'change' | 'request';
    status: string;
    date: string; // Using a placeholder date since backend might not provide created_at yet, or we use ID as proxy
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        incidents: 0,
        problems: 0,
        requests: 0,
        changes: 0,
        pending: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [incidents, problems, requests, changes] = await Promise.all([
                    getIncidents(),
                    getProblems(),
                    getServiceRequests(),
                    getChangeRequests(),
                ]);

                setStats({
                    incidents: incidents.length,
                    problems: problems.length,
                    requests: requests.length,
                    changes: changes.length,
                    pending: incidents.filter(i => i.status === 'pending').length +
                        requests.filter(r => r.status === 'pending').length +
                        changes.filter(c => c.status === 'requested').length,
                });

                // Combine and sort for recent activity
                // Note: Assuming higher ID means newer for now as we don't have created_at in the interface explicitly shown in previous files
                // In a real app, use created_at date.
                const activities: RecentActivity[] = [
                    ...incidents.map(i => ({ id: i.id, title: i.title, type: 'incident' as const, status: i.status, date: 'Today' })),
                    ...problems.map(p => ({ id: p.id, title: p.title, type: 'problem' as const, status: p.status, date: 'Yesterday' })),
                    ...changes.map(c => ({ id: c.id, title: c.title, type: 'change' as const, status: c.status, date: '2 days ago' })),
                    ...requests.map(r => ({ id: r.id, title: r.title, type: 'request' as const, status: r.status, date: 'Today' })),
                ].sort((a, b) => b.id - a.id).slice(0, 5);

                setRecentActivity(activities);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
        <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-105 ${gradient}`}>
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white opacity-10 blur-xl"></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-90">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                </div>
                <div className={`rounded-xl bg-white/20 p-3 backdrop-blur-sm`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium opacity-80">
                <ArrowUpRight size={14} className="mr-1" />
                <span>Updated just now</span>
            </div>
        </div>
    );

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'incident': return <AlertCircle size={18} className="text-red-500" />;
            case 'problem': return <AlertTriangle size={18} className="text-orange-500" />;
            case 'change': return <Activity size={18} className="text-purple-500" />;
            case 'request': return <CheckCircle size={18} className="text-blue-500" />;
            default: return <Clock size={18} className="text-gray-500" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'incident': return 'bg-red-50 text-red-700 border-red-100';
            case 'problem': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'change': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'request': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Overview of your IT service management status</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border shadow-sm">
                    <Clock size={16} />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Incidents"
                    value={stats.incidents}
                    icon={AlertCircle}
                    gradient="bg-gradient-to-br from-red-500 to-rose-600"
                />
                <StatCard
                    title="Active Problems"
                    value={stats.problems}
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-orange-500 to-amber-600"
                />
                <StatCard
                    title="Service Requests"
                    value={stats.requests}
                    icon={CheckCircle}
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    title="Change Requests"
                    value={stats.changes}
                    icon={Activity}
                    gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" />
                                Recent Activity
                            </h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item, index) => (
                                    <div key={`${item.type}-${item.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/${item.type}s/${item.id}/edit`)}>
                                        <div className={`p-3 rounded-xl ${getActivityColor(item.type)}`}>
                                            {getActivityIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{item.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{item.type}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-500 capitalize">{item.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Server size={20} className="text-gray-500" />
                            System Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Database size={18} className="text-green-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Database</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-green-700">Operational</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Server size={18} className="text-green-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">API Gateway</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-green-700">Operational</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Shield size={18} className="text-yellow-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Auth Service</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-yellow-700">Degraded</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Need Help?</h3>
                        <p className="text-indigo-100 text-sm mb-4 relative z-10">Check our documentation or contact support for assistance.</p>
                        <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors relative z-10">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
