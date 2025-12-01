import api from './api';
import type { ChangeRequest } from '../types';

export const getChangeRequests = async () => {
    const response = await api.get<ChangeRequest[]>('/change-request');
    return response.data;
};

export const getChangeRequest = async (id: number) => {
    const response = await api.get<ChangeRequest>(`/change-request/${id}`);
    return response.data;
};

export const createChangeRequest = async (data: Partial<ChangeRequest> & { requesterId: number }) => {
    const response = await api.post<ChangeRequest>('/change-request', data);
    return response.data;
};

export const updateChangeRequest = async (id: number, data: Partial<ChangeRequest> & { assignedId?: number; approverId?: number }) => {
    const response = await api.patch<ChangeRequest>(`/change-request/${id}`, data);
    return response.data;
};

export const deleteChangeRequest = async (id: number) => {
    const response = await api.delete(`/change-request/${id}`);
    return response.data;
};
