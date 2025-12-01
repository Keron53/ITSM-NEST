
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    AlertCircle,
    AlertTriangle,
    GitPullRequest,
    ClipboardList,
    Users
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/incidents', label: 'Incidents', icon: AlertCircle },
        { path: '/problems', label: 'Problems', icon: AlertTriangle },
        { path: '/changes', label: 'Changes', icon: GitPullRequest },
        { path: '/requests', label: 'Service Requests', icon: ClipboardList },
        { path: '/users', label: 'Users', icon: Users },
    ];

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold text-blue-500">ITSM Portal</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
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
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        JD
                    </div>
                    <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
