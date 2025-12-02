import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createIncident, getIncident, updateIncident } from '../../services/incidents.service';
import { getUsers } from '../../services/users.service';
import { getProblems } from '../../services/problems.service';
import { IncidentCategory, IncidentPriority, IncidentStatus, RelatedDevices } from '../../types';
import type { User, Problem } from '../../types';
import { useAuth } from '../../context/AuthContext';

const IncidentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isEdit = !!id;
    const isUserRole = currentUser?.role === 'user';
    const isAgent = currentUser?.role === 'agent';

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        incidentArea: string;
        category: IncidentCategory;
        priority: IncidentPriority;
        relatedDevice: RelatedDevices;
        status: IncidentStatus;
        reporterId: string;
        assignedId: string;
        relatedProblemId: string;
        closureNotes: string;
    }>({
        title: '',
        description: '',
        incidentArea: '',
        category: IncidentCategory.HARDWARE,
        priority: IncidentPriority.LOW,
        relatedDevice: RelatedDevices.COMPUTER,
        status: IncidentStatus.PENDING,
        reporterId: '',
        assignedId: '',
        relatedProblemId: '',
        closureNotes: '',
    });

    const [users, setUsers] = useState<User[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);

    useEffect(() => {
        loadUsers();
        loadProblemsList();
        if (isEdit) {
            loadIncident();
        } else if ((isUserRole || isAgent) && currentUser) {
            // Set defaults for user AND agent role on creation
            setFormData(prev => ({
                ...prev,
                reporterId: currentUser.id.toString(),
                incidentArea: currentUser.department || '',
            }));
        }
    }, [id, isUserRole, isAgent, currentUser]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadProblemsList = async () => {
        try {
            const data = await getProblems();
            setProblems(data);
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    };

    const loadIncident = async () => {
        try {
            const data = await getIncident(Number(id));
            setFormData({
                title: data.title,
                description: data.description,
                incidentArea: data.incidentArea,
                category: data.category,
                priority: data.priority,
                relatedDevice: data.relatedDevice as RelatedDevices,
                status: data.status,
                reporterId: data.reporter?.id.toString() || '',
                assignedId: data.assignee?.id.toString() || '',
                relatedProblemId: data.relatedProblem?.id.toString() || '',
                closureNotes: data.closureNotes || '',
            });
        } catch (error) {
            console.error('Error loading incident:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                incidentArea: formData.incidentArea,
                category: formData.category,
                priority: formData.priority,
                relatedDevice: formData.relatedDevice,
                status: formData.status,
                reporterId: Number(formData.reporterId),
                assignedId: formData.assignedId ? Number(formData.assignedId) : undefined,
                relatedProblem: formData.relatedProblemId ? Number(formData.relatedProblemId) : undefined,
                closureNotes: formData.closureNotes || undefined,
            };

            if (isEdit) {
                await updateIncident(Number(id), payload);
            } else {
                await createIncident(payload);
            }
            navigate('/incidents');
        } catch (error) {
            console.error('Error saving incident:', error);
        }
    };

    const isAdmin = currentUser?.role === 'admin';
    // isAgent already declared above
    const isReporter = currentUser?.id.toString() === formData.reporterId;
    const isAssignee = currentUser?.id.toString() === formData.assignedId;

    // Agent as Reporter (Edit mode): Can edit Title, Description, Area, Category, Priority, Related Device.
    // Agent as Assignee (Edit mode): Can ONLY edit Closure Notes if Resolved/Canceled. Otherwise strict view only (actions in list).

    const isAgentBlockedView =
        isAgent &&
        isReporter &&
        formData.status !== IncidentStatus.PENDING;

    // Caso 2: El agente es reporter, NO pending, y SÍ assignee → solo closure notes
    const isAgentReporterAssigneeClosureOnly =
        isAgent &&
        isReporter &&
        isAssignee &&
        (formData.status === IncidentStatus.RESOLVED || formData.status === IncidentStatus.CANCELED) &&
        !formData.closureNotes;

    // Global View Only si:
    // - Usuario normal y estado ≠ pending
    // - Agente sin relación con el incident
    // - Agente reporter bloqueado (caso 1)
    const isGlobalViewOnly =
        !isAdmin && (
            (isUserRole && isEdit && formData.status !== IncidentStatus.PENDING) ||
            (isAgent && isEdit && !isReporter && !isAssignee) ||
            isAgentBlockedView
        );

    const canAssigneeEditClosureNotes =
        isEdit &&
        isAgent &&
        isAssignee &&
        !isReporter &&
        (formData.status === IncidentStatus.RESOLVED || formData.status === IncidentStatus.CANCELED) &&
        !formData.closureNotes;

    // Field specific ReadOnly logic
    const isTitleReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isDescriptionReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isAreaReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isCategoryReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isPriorityReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isDeviceReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));

    const isReporterReadOnly = !isAdmin; // Always read-only for User/Agent
    const isAssigneeReadOnly = !isAdmin; // Only Admin can assign
    const isRelatedProblemReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit)); // Agent never edits related problem? Assuming similar to destination area/receiver in SR.

    const isClosureNotesReadOnly = !isAdmin && !(canAssigneeEditClosureNotes || isAgentReporterAssigneeClosureOnly);


    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit
                    ? isGlobalViewOnly
                        ? 'Incident Information'
                        : 'Edit Incident'
                    : 'New Incident'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        maxLength={60}
                        className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={isTitleReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        maxLength={200}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={isDescriptionReadOnly}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                        <input
                            type="text"
                            required
                            maxLength={60}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.incidentArea}
                            onChange={(e) => setFormData({ ...formData, incidentArea: e.target.value })}
                            disabled={isAreaReadOnly}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
                            disabled={isCategoryReadOnly}
                        >
                            {Object.values(IncidentCategory).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as IncidentPriority })}
                            disabled={isPriorityReadOnly}
                        >
                            {Object.values(IncidentPriority).map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Device</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.relatedDevice}
                            onChange={(e) => setFormData({ ...formData, relatedDevice: e.target.value as RelatedDevices })}
                            disabled={isDeviceReadOnly}
                        >
                            {Object.values(RelatedDevices).map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reporter</label>
                        <select
                            required
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.reporterId}
                            onChange={(e) => setFormData({ ...formData, reporterId: e.target.value })}
                            disabled={isReporterReadOnly}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    {!isUserRole && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                            <select
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                value={formData.assignedId}
                                onChange={(e) => {
                                    const newAssignedId = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        assignedId: newAssignedId,
                                        status: (newAssignedId && prev.status === IncidentStatus.PENDING)
                                            ? IncidentStatus.IN_PROGRESS
                                            : prev.status
                                    }));
                                }}
                                disabled={isAssigneeReadOnly}
                            >
                                <option value="">Unassigned</option>
                                {users.filter(u => u.role !== 'user').map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {!isUserRole && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Problem</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.relatedProblemId}
                            onChange={(e) => setFormData({ ...formData, relatedProblemId: e.target.value })}
                            disabled={isRelatedProblemReadOnly}
                        >
                            <option value="">None</option>
                            {problems.map((problem) => (
                                <option key={problem.id} value={problem.id}>{problem.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
                                disabled={!isAdmin} // Status is read-only unless admin
                            >
                                {Object.values(IncidentStatus).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        {!isUserRole && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Closure Notes</label>
                                <textarea
                                    rows={3}
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                    value={formData.closureNotes}
                                    onChange={(e) => setFormData({ ...formData, closureNotes: e.target.value })}
                                    disabled={isClosureNotesReadOnly}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/incidents')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {isGlobalViewOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!isGlobalViewOnly && !canAssigneeEditClosureNotes && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update Incident' : 'Create Incident'}
                        </button>
                    )}
                    {(canAssigneeEditClosureNotes || isAgentReporterAssigneeClosureOnly) && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update Closure Notes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default IncidentForm;

