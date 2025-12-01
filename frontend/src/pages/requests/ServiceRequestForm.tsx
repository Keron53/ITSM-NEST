import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createServiceRequest, getServiceRequest, updateServiceRequest } from '../../services/service-request.service';
import { getUsers } from '../../services/users.service';
import { RequestPriority, RequestStatus } from '../../types';
import type { User } from '../../types';

const ServiceRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        originArea: string;
        destinationArea: string;
        priority: RequestPriority;
        status: RequestStatus;
        requesterId: string;
        receiverId: string;
        postComments: string;
    }>({
        title: '',
        description: '',
        originArea: '',
        destinationArea: '',
        priority: RequestPriority.LOW,
        status: RequestStatus.PENDING,
        requesterId: '',
        receiverId: '',
        postComments: '',
    });

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadRequest();
        }
    }, [id]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadRequest = async () => {
        try {
            const data = await getServiceRequest(Number(id));
            setFormData({
                title: data.title,
                description: data.description,
                originArea: data.originArea,
                destinationArea: data.destinationArea || '',
                priority: data.priority,
                status: data.status,
                requesterId: data.requester?.id.toString() || '',
                receiverId: data.receiver?.id.toString() || '',
                postComments: data.postComments || '',
            });
        } catch (error) {
            console.error('Error loading service request:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                destinationArea: formData.destinationArea || undefined,
                postComments: formData.postComments || undefined,
                requesterId: Number(formData.requesterId),
                receiverId: formData.receiverId ? Number(formData.receiverId) : undefined,
            };

            if (isEdit) {
                await updateServiceRequest(Number(id), payload);
            } else {
                await createServiceRequest(payload);
            }
            navigate('/requests');
        } catch (error) {
            console.error('Error saving service request:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? 'Edit Service Request' : 'New Service Request'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origin Area</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.originArea}
                            onChange={(e) => setFormData({ ...formData, originArea: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination Area</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.destinationArea}
                            onChange={(e) => setFormData({ ...formData, destinationArea: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as RequestPriority })}
                        >
                            {Object.values(RequestPriority).map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                        <select
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.requesterId}
                            onChange={(e) => setFormData({ ...formData, requesterId: e.target.value })}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.receiverId}
                            onChange={(e) => setFormData({ ...formData, receiverId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role !== 'user').map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as RequestStatus })}
                            >
                                {Object.values(RequestStatus).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Post Comments</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.postComments}
                            onChange={(e) => setFormData({ ...formData, postComments: e.target.value })}
                        />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/requests')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {isEdit ? 'Update Service Request' : 'Create Service Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceRequestForm;
