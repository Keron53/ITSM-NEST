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
    const { user: currentUser } = useAuth();
    const isEdit = !!id;
    const isUserRole = currentUser?.role === 'user';
    const isAgent = currentUser?.role === 'agent';

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

    const [metadata, setMetadata] = useState<{
        reportDate?: string;
        resolutionDate?: string;
        closeDate?: string;
    }>({});

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadProblem();
        } else if (currentUser) {
            // Set defaults for ALL roles on creation
            setFormData(prev => ({
                ...prev,
                reporterId: currentUser.id.toString(),
                problemArea: currentUser.department || '',
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
            setMetadata({
                reportDate: data.reportDate,
                resolutionDate: data.resolutionDate,
                closeDate: data.closeDate,
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

    const isAdmin = currentUser?.role === 'admin';
    // isAgent already declared above
    const isReporter = currentUser?.id.toString() === formData.reporterId;
    const isAssignee = currentUser?.id.toString() === formData.assignedId;

    // Agent as Reporter (Edit mode): Can edit Title, Description, Area, Category, Priority, Cause.
    // Agent as Assignee (Edit mode): Can ONLY edit Solution/Closure Notes if Resolved/Canceled. Otherwise strict view only (actions in list).

    const isAgentBlockedView =
        isAgent &&
        isReporter &&
        formData.status !== ProblemStatus.PENDING;

    // Caso 2: El agente es reporter, NO pending, y SÍ assignee → solo closure notes
    const isAgentReporterAssigneeClosureOnly =
        isAgent &&
        isReporter &&
        isAssignee &&
        (formData.status === ProblemStatus.RESOLVED || formData.status === ProblemStatus.CANCELED);

    // Global View Only si:
    // - Usuario normal y estado ≠ pending
    // - Agente sin relación con el problem
    // - Agente reporter bloqueado (caso 1)
    const isGlobalViewOnly =
        !isAdmin && (
            (isUserRole && isEdit && formData.status !== ProblemStatus.PENDING) ||
            (isAgent && isEdit && !isReporter && !isAssignee) ||
            isAgentBlockedView
        );

    const canAssigneeEditClosureNotes =
        isEdit &&
        isAgent &&
        isAssignee &&
        !isReporter &&
        (formData.status === ProblemStatus.RESOLVED || formData.status === ProblemStatus.CANCELED);

    // Field specific ReadOnly logic
    const isTitleReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isDescriptionReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isAreaReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isCategoryReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isPriorityReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));
    const isCauseReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isReporter));

    const isReporterReadOnly = true; // Always read-only.
    const isAssigneeReadOnly = !isAdmin; // Only Admin can assign

    const isClosureNotesReadOnly = !isAdmin && !(canAssigneeEditClosureNotes || isAgentReporterAssigneeClosureOnly);
    const isSolutionReadOnly = !isAdmin && !(canAssigneeEditClosureNotes || isAgentReporterAssigneeClosureOnly);


    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit
                    ? isGlobalViewOnly
                        ? 'Problem Information'
                        : 'Edit Problem'
                    : 'New Problem'}
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
                        rows={4}
                        maxLength={200}
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
                            value={formData.problemArea}
                            onChange={(e) => setFormData({ ...formData, problemArea: e.target.value })}
                            disabled={isAreaReadOnly}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProblemCategory })}
                            disabled={isCategoryReadOnly}
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
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProblemPriority })}
                            disabled={isPriorityReadOnly}
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
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.cause}
                            onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                            disabled={isCauseReadOnly}
                        />
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

                    {(isEdit || !isUserRole) && (
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
                                        status: (isAdmin && newAssignedId) ? ProblemStatus.IN_PROGRESS : prev.status
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

                {(isEdit || isAdmin) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProblemStatus })}
                            disabled={!isAdmin}
                        >
                            {Object.values(ProblemStatus).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {isEdit && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Implemented Solution</label>
                            <textarea
                                rows={3}
                                maxLength={200}
                                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed`}
                                value={formData.implementedSolution}
                                onChange={(e) => setFormData({ ...formData, implementedSolution: e.target.value })}
                                disabled={isSolutionReadOnly}
                            />
                        </div>
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
                    </>
                )}

                {isEdit && (
                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Reported On</label>
                            <p className="text-sm text-gray-700">{metadata.reportDate ? new Date(metadata.reportDate).toLocaleString() : '-'}</p>
                        </div>
                        {metadata.resolutionDate && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Resolved On</label>
                                <p className="text-sm text-gray-700">{new Date(metadata.resolutionDate).toLocaleString()}</p>
                            </div>
                        )}
                        {metadata.closeDate && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Closed On</label>
                                <p className="text-sm text-gray-700">{new Date(metadata.closeDate).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/problems')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {isGlobalViewOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!isGlobalViewOnly && !canAssigneeEditClosureNotes && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update Problem' : 'Create Problem'}
                        </button>
                    )}
                    {(canAssigneeEditClosureNotes || isAgentReporterAssigneeClosureOnly) && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update Problem
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProblemForm;
