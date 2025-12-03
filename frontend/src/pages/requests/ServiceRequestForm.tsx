import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createServiceRequest, getServiceRequest, updateServiceRequest } from '../../services/service-request.service';
import { getUsers } from '../../services/users.service';
import { RequestPriority, RequestStatus } from '../../types';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

const ServiceRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isEdit = !!id;
    const isUserRole = currentUser?.role === 'user';

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

    const [metadata, setMetadata] = useState<{
        requestDate?: string;
        assignedDate?: string;
        completedDate?: string;
    }>({});

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadRequest();
        } else if (currentUser) {
            // Set defaults for ALL roles on creation
            setFormData(prev => ({
                ...prev,
                requesterId: currentUser.id.toString(),
                originArea: currentUser.department || '',
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
            setMetadata({
                requestDate: data.requestDate,
                assignedDate: data.assignedDate,
                completedDate: data.completedDate,
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

    const isAdmin = currentUser?.role === 'admin';
    const isAgent = currentUser?.role === 'agent';
    const isRequester = currentUser?.id.toString() === formData.requesterId;
    const isReceiver = currentUser?.id.toString() === formData.receiverId;
    const isPending = formData.status === RequestStatus.PENDING;

    // Agent as Requester (Edit mode): Can edit Title, Origin, Priority.
    // Agent as Receiver (Edit mode): Can ONLY edit Post Comments if Completed/Canceled. Otherwise strict view only (actions in list).



    // General View Only:
    // - User: if not pending
    // - Agent: if not requester AND not receiver
    // - Agent Receiver: if NOT completed/canceled (actions only in list), OR if completed/canceled (can only edit post comments)

    // We'll use specific disabled flags for groups of fields instead of a single global one to handle the mixed state.

    const isAgentBlockedView =
        isAgent &&
        isRequester &&
        //formData.status !== RequestStatus.PENDING &&
        //!isReceiver;
        formData.status !== RequestStatus.PENDING;

    // Caso 2: El agente es requester, NO pending, y SÍ receiver → solo post comments
    const isAgentRequesterReceiverPostOnly =
        isAgent &&
        isRequester &&
        isReceiver &&
        formData.status !== RequestStatus.PENDING;

    // Global View Only si:
    // - Usuario normal y estado ≠ pending
    // - Agente sin relación con el request
    // - Agente requester bloqueado (caso 1)
    const isGlobalViewOnly =
        !isAdmin && (
            (isUserRole && isEdit && formData.status !== RequestStatus.PENDING) ||
            (isAgent && isEdit && !isRequester && !isReceiver) ||
            isAgentBlockedView
        );

    const canReceiverEditPostComments =
        isEdit &&
        isAgent &&
        isReceiver &&
        !isRequester &&
        formData.status !== RequestStatus.PENDING;

    // Field specific ReadOnly logic
    const isTitleReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isRequester)); // Agent can only edit if requester
    const isOriginReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isRequester));
    const isPriorityReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit && !isRequester));

    const isDestinationReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit)); // Agent never edits destination? Plan said "Agent as Requester: Can edit Title, Origin, Priority". So Destination is RO.
    const isReceiverReadOnly = !isAdmin && (isGlobalViewOnly || (isAgent && isEdit)); // Agent never edits receiver?
    const isRequesterReadOnly = true; // Always read-only for everyone
    const isPostCommentsReadOnly = !isAdmin && !(canReceiverEditPostComments || isAgentRequesterReceiverPostOnly);


    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit
                    ? isGlobalViewOnly
                        ? 'Service Request Information'
                        : 'Edit Service Request'
                    : 'New Service Request'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={isTitleReadOnly} // Same rules as title? Usually description is editable by requester too.
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origin Area</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                            value={formData.originArea}
                            onChange={(e) => setFormData({ ...formData, originArea: e.target.value })}
                            disabled={isOriginReadOnly}
                        />
                    </div>

                    {(isEdit || isAdmin) && (!isUserRole || !isPending) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Area</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.destinationArea}
                                onChange={(e) => setFormData({ ...formData, destinationArea: e.target.value })}
                                disabled={isDestinationReadOnly}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as RequestPriority })}
                            disabled={isPriorityReadOnly}
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
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                            value={formData.requesterId}
                            onChange={(e) => {
                                const newRequesterId = e.target.value;
                                const selectedRequester = users.find(u => u.id.toString() === newRequesterId);
                                setFormData(prev => ({
                                    ...prev,
                                    requesterId: newRequesterId,
                                    originArea: (isAdmin && selectedRequester?.department) ? selectedRequester.department : prev.originArea
                                }));
                            }}
                            disabled={isRequesterReadOnly}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {(isEdit || isAdmin) && (!isUserRole || !isPending) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.receiverId}
                                onChange={(e) => {
                                    const newReceiverId = e.target.value;
                                    const selectedReceiver = users.find(u => u.id.toString() === newReceiverId);
                                    setFormData(prev => ({
                                        ...prev,
                                        receiverId: newReceiverId,
                                        destinationArea: selectedReceiver?.department || prev.destinationArea,
                                        status: (newReceiverId && prev.status === RequestStatus.PENDING)
                                            ? RequestStatus.IN_PROGRESS
                                            : prev.status
                                    }));
                                }}
                                disabled={isReceiverReadOnly}
                            >
                                <option value="">Unassigned</option>
                                {users.filter(u => u.role !== 'user').map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(isEdit || isAdmin) && (!isUserRole || !isPending) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as RequestStatus })}
                                disabled={!isAdmin} // Status is read-only unless admin
                            >
                                {Object.values(RequestStatus).map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>



                {
                    isEdit && (!isUserRole || !isPending) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Post Comments</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.postComments}
                                onChange={(e) => setFormData({ ...formData, postComments: e.target.value })}
                                disabled={isPostCommentsReadOnly}
                            />
                        </div>
                    )
                }

                {isEdit && (!isUserRole || !isPending) && (
                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Requested On</label>
                            <p className="text-sm text-gray-700">{metadata.requestDate ? new Date(metadata.requestDate).toLocaleString() : '-'}</p>
                        </div>
                        {metadata.assignedDate && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Assigned On</label>
                                <p className="text-sm text-gray-700">{new Date(metadata.assignedDate).toLocaleString()}</p>
                            </div>
                        )}
                        {metadata.completedDate && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Completed On</label>
                                <p className="text-sm text-gray-700">{new Date(metadata.completedDate).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/requests')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {isGlobalViewOnly ? 'Back' : 'Cancel'}
                    </button>
                    {!isGlobalViewOnly && !canReceiverEditPostComments && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? 'Update Service Request' : 'Create Service Request'}
                        </button>
                    )}

                    {(canReceiverEditPostComments || isAgentRequesterReceiverPostOnly) && (
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update Comments
                        </button>
                    )}

                </div>
            </form >
        </div >
    );
};

export default ServiceRequestForm;
