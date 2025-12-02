import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    AlertCircle,
    AlertTriangle,
    GitPullRequest,
    ClipboardList,
    Users,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent', 'user'] },
        { path: '/incidents', label: 'Incidents', icon: AlertCircle, roles: ['admin', 'agent', 'user'] },
        { path: '/problems', label: 'Problems', icon: AlertTriangle, roles: ['admin', 'agent'] },
        { path: '/changes', label: 'Changes', icon: GitPullRequest, roles: ['admin', 'agent'] },
        { path: '/requests', label: 'Service Requests', icon: ClipboardList, roles: ['admin', 'agent', 'user'] },
        { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'U';
    };

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-blue-500">ITSM Portal</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
                        {getInitials(user?.name || '')}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
