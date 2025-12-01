import api from './api';
import type { ServiceRequest } from '../types';

export const getServiceRequests = async () => {
    const response = await api.get<ServiceRequest[]>('/service-request');
    return response.data;
};

export const getServiceRequest = async (id: number) => {
    const response = await api.get<ServiceRequest>(`/service-request/${id}`);
    return response.data;
};

export const createServiceRequest = async (data: Partial<ServiceRequest> & { requesterId: number }) => {
    const response = await api.post<ServiceRequest>('/service-request', data);
    return response.data;
};

export const updateServiceRequest = async (id: number, data: Partial<ServiceRequest> & { receiverId?: number }) => {
    const response = await api.patch<ServiceRequest>(`/service-request/${id}`, data);
    return response.data;
};

export const deleteServiceRequest = async (id: number) => {
    const response = await api.delete(`/service-request/${id}`);
    return response.data;
};
