import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createChangeRequest, getChangeRequest, updateChangeRequest } from '../../services/change-request.service';
import { getUsers } from '../../services/users.service';
import { ChangePriority, ChangeStatus, ChangeType, UserRole } from '../../types';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ChangeRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        justification: '',
        type: ChangeType.NORMAL as ChangeType,
        area: '',
        priority: ChangePriority.LOW as ChangePriority,
        status: ChangeStatus.REQUESTED as ChangeStatus,
        requesterId: '',
        assignedId: '',
        approverId: '',
        implementationPlan: '',
        rollbackPlan: '',
        closureNotes: '',
    });

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadChange();
        } else if (currentUser) {
            // Set defaults
            setFormData(prev => ({
                ...prev,
                requesterId: currentUser.id.toString(),
                area: currentUser.department || '',
            }));
        }
    }, [id, currentUser]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadChange = async () => {
        try {
            const data = await getChangeRequest(Number(id));
            setFormData({
                title: data.title,
                description: data.description,
                justification: data.justification || '',
                type: data.type,
                area: data.area,
                priority: data.priority,
                status: data.status,
                requesterId: data.requester?.id.toString() || '',
                assignedId: data.assignee?.id.toString() || '',
                approverId: data.approver?.id.toString() || '',
                implementationPlan: data.implementationPlan,
                rollbackPlan: data.rollbackPlan,
                closureNotes: data.closureNotes || '',
            });
        } catch (error) {
            console.error('Error loading change request:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.requesterId) {
                alert('Please select a requester');
                return;
            }

            const payload = {
                ...formData,
                requesterId: Number(formData.requesterId),
                assignedId: formData.assignedId ? Number(formData.assignedId) : undefined,
                approverId: formData.approverId ? Number(formData.approverId) : undefined,
                closureNotes: formData.closureNotes || undefined,
            };

            if (isEdit) {
                await updateChangeRequest(Number(id), payload);
            } else {
                await createChangeRequest(payload);
            }
            navigate('/changes');
        } catch (error) {
            console.error('Error saving change request:', error);
        }
    };

    const isAdmin = currentUser?.role === 'admin';
    const isAgent = currentUser?.role === 'agent';

    const isRequester = currentUser?.id.toString() === formData.requesterId;
    const isAssignee = currentUser?.id.toString() === formData.assignedId;
    const isApprover = currentUser?.id.toString() === formData.approverId;
    const isPending = formData.status === ChangeStatus.REQUESTED;

    // View Logic
    // Agent blocked if Requester and NOT Pending (can only view read-only) -> Actually, "Blocked View" in Incident meant they couldn't see it at all? 
    // In Incident: "isAgentBlockedView = isAgent && isReporter && !isPending" -> This was used to force "Global View Only".
    // So they CAN see it, but it's Read Only.

    const canAssigneeEditClosure = isAssignee && (
        formData.status === ChangeStatus.COMPLETED ||
        formData.status === ChangeStatus.FAILED
    );

    const isAgentBlockedView = isAgent && isRequester && (!isPending || !!formData.assignedId || !!formData.approverId);

    // Global View Only if:
    // - Not Admin AND
    // - (Agent & Edit & Not Related) OR
    // - (Agent & Requester & Not Pending) -> UNLESS they can edit closure notes
    const isGlobalViewOnly = !isAdmin && (
        (isAgent && isEdit && !isRequester && !isAssignee && !isApprover) ||
        (isAgentBlockedView && !canAssigneeEditClosure)
    );

    // Field Locking
    // General fields are read-only if Global View Only OR (Agent & Edit & Not Requester) OR (Agent Blocked View)
    const isGeneralReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isRequester) || isAgentBlockedView);

    // User Selects: Only Admin can change Requester, Assignee, Approver.
    // Exception: Maybe Requester can change Assignee/Approver? Usually no, Admin assigns.
    const isUserSelectReadOnly = !isAdmin;
    const isRequesterReadOnly = true; // Always read-only (set on creation)

    // Status: Only Admin can change status via dropdown. 
    // Agents use buttons in List.
    const isStatusReadOnly = !isAdmin;

    const isClosureNotesReadOnly = !isAdmin && !canAssigneeEditClosure;


    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit
                    ? isGlobalViewOnly
                        ? 'Change Request Information'
                        : 'Edit Change Request'
                    : 'New Change Request'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                        <textarea
                            rows={2}
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.justification}
                            onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as ChangeType })}
                        >
                            {Object.values(ChangeType).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ChangePriority })}
                        >
                            {Object.values(ChangePriority).map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                        <input
                            type="text"
                            required
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                        <select
                            required
                            disabled={isRequesterReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.requesterId}
                            onChange={(e) => setFormData({ ...formData, requesterId: e.target.value })}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Plan</label>
                        <textarea
                            required
                            rows={3}
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.implementationPlan}
                            onChange={(e) => setFormData({ ...formData, implementationPlan: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rollback Plan</label>
                        <textarea
                            required
                            rows={3}
                            disabled={isGeneralReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.rollbackPlan}
                            onChange={(e) => setFormData({ ...formData, rollbackPlan: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                        <select
                            disabled={isUserSelectReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.assignedId}
                            onChange={(e) => setFormData({ ...formData, assignedId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role !== UserRole.USER).map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approver</label>
                        <select
                            disabled={isUserSelectReadOnly}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.approverId}
                            onChange={(e) => setFormData({ ...formData, approverId: e.target.value })}
                        >
                            <option value="">Unassigned</option>
                            {users.filter(u => u.role !== UserRole.USER).map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    {(isEdit || isAdmin) && (
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                disabled={isStatusReadOnly}
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ChangeStatus })}
                            >
                                {Object.values(ChangeStatus).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isEdit && (
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Closure Notes</label>
                            <textarea
                                rows={3}
                                disabled={isClosureNotesReadOnly}
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                value={formData.closureNotes}
                                onChange={(e) => setFormData({ ...formData, closureNotes: e.target.value })}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/changes')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {isGlobalViewOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!isGlobalViewOnly && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update Change Request' : 'Create Change Request'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ChangeRequestForm;
