import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import { getUsers, deleteUser } from '../../services/users.service';
import type { User } from '../../types';

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleDelete = async (user: User) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(user.id);
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof User },
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        {
            header: 'Role',
            accessor: (item: User) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        item.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.role.toUpperCase()}
                </span>
            )
        },
        { header: 'Department', accessor: (item: User) => item.department || '-' },
        {
            header: 'Status',
            accessor: (item: User) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {item.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <button
                    onClick={() => navigate('/users/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New User
                </button>
            </div>

            <Table
                data={users}
                columns={columns}
                onEdit={(item) => navigate(`/users/${item.id}/edit`)}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default UserList;
