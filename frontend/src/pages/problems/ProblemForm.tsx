import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProblem, getProblem, updateProblem } from '../../services/problems.service';
import { getUsers } from '../../services/users.service';
import { ProblemCategory, ProblemPriority, ProblemStatus } from '../../types';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ProblemForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        problemArea: string;
        category: ProblemCategory;
        priority: ProblemPriority;
        status: ProblemStatus;
        cause: string;
        reporterId: string;
        assignedId: string;
        implementedSolution: string;
        closureNotes: string;
    }>({
        title: '',
        description: '',
        problemArea: '',
        category: ProblemCategory.HARDWARE,
        priority: ProblemPriority.LOW,
        status: ProblemStatus.PENDING,
        cause: '',
        reporterId: '',
        assignedId: '',
        implementedSolution: '',
        closureNotes: '',
    });

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadProblem();
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

    const loadProblem = async () => {
        try {
            const data = await getProblem(Number(id));
            setFormData({
                title: data.title,
                description: data.description,
                problemArea: data.problemArea,
                category: data.category,
                priority: data.priority,
                status: data.status,
                cause: data.cause,
                reporterId: data.reporter?.id.toString() || '',
                assignedId: data.assignee?.id.toString() || '',
                implementedSolution: data.implementedSolution || '',
                closureNotes: data.closureNotes || '',
            });
        } catch (error) {
            console.error('Error loading problem:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                reporterId: Number(formData.reporterId),
                assignedId: formData.assignedId ? Number(formData.assignedId) : undefined,
                implementedSolution: formData.implementedSolution || undefined,
                closureNotes: formData.closureNotes || undefined,
            };

            if (isEdit) {
                await updateProblem(Number(id), payload);
            } else {
                await createProblem(payload);
            }
            navigate('/problems');
        } catch (error) {
            console.error('Error saving problem:', error);
        }
    };

    const { user } = useAuth();
    const isAgent = user?.role === 'agent';
    const isReporter = user?.id === Number(formData.reporterId);
    const isAssignee = user?.id === Number(formData.assignedId);

    // If agent and NOT reporter (and is edit mode), restrict fields
    // If isAssignee, allow status and closureNotes (if applicable)
    // If neither, disable all
    const disableGeneralFields = isEdit && isAgent && !isReporter;
    const disableStatus = isEdit && isAgent && !isReporter && !isAssignee;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? 'Edit Problem' : 'New Problem'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        maxLength={60}
                        disabled={disableGeneralFields}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        maxLength={200}
                        disabled={disableGeneralFields}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                        <input
                            type="text"
                            required
                            maxLength={60}
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.problemArea}
                            onChange={(e) => setFormData({ ...formData, problemArea: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProblemCategory })}
                        >
                            {Object.values(ProblemCategory).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProblemPriority })}
                        >
                            {Object.values(ProblemPriority).map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
                        <input
                            type="text"
                            required
                            maxLength={200}
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.cause}
                            onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                        <select
                            required
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.reporterId}
                            onChange={(e) => setFormData({ ...formData, reporterId: e.target.value })}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                        <select
                            disabled={disableGeneralFields}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            value={formData.assignedId}
                            onChange={(e) => setFormData({ ...formData, assignedId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role !== 'user').map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                disabled={disableStatus}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProblemStatus })}
                            >
                                {Object.values(ProblemStatus).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Implemented Solution</label>
                            <textarea
                                rows={3}
                                maxLength={200}
                                disabled={disableGeneralFields}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                value={formData.implementedSolution}
                                onChange={(e) => setFormData({ ...formData, implementedSolution: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Closure Notes</label>
                            <textarea
                                rows={3}
                                disabled={disableStatus}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                value={formData.closureNotes}
                                onChange={(e) => setFormData({ ...formData, closureNotes: e.target.value })}
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/problems')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    {!disableStatus && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update Problem' : 'Create Problem'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProblemForm;
