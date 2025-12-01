import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../../services/users.service';
import { UserRole } from '../../types';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        role: UserRole;
        department: string;
        phone: string;
        active: boolean;
    }>({
        name: '',
        email: '',
        password: '',
        role: UserRole.USER,
        department: '',
        phone: '',
        active: true,
    });

    useEffect(() => {
        if (isEdit) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            const data = await getUser(Number(id));
            setFormData({
                name: data.name,
                email: data.email,
                password: '', // Don't populate password on edit
                role: data.role,
                department: data.department || '',
                phone: data.phone || '',
                active: data.active,
            });
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!isEdit && formData.password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        if (formData.phone && formData.phone.length > 10) {
            alert('Phone number must be at most 10 characters');
            return;
        }

        try {
            // Clean payload: convert empty strings to undefined
            const payload = {
                ...formData,
                department: formData.department || undefined,
                phone: formData.phone || undefined,
            };

            if (isEdit && !payload.password) {
                delete (payload as any).password; // Don't send empty password on update
            }

            if (isEdit) {
                await updateUser(Number(id), payload);
            } else {
                await createUser(payload);
            }
            navigate('/users');
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user. Please check the console for details.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? 'Edit User' : 'New User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEdit ? 'Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                        type="password"
                        required={!isEdit}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        >
                            {Object.values(UserRole).map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.active ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {isEdit ? 'Update User' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
