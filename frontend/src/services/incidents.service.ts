import api from './api';
import type { Incident } from '../types';

export const getIncidents = async () => {
    const response = await api.get<Incident[]>('/incidents');
    return response.data;
};

export const getIncident = async (id: number) => {
    const response = await api.get<Incident>(`/incidents/${id}`);
    return response.data;
};

export const createIncident = async (data: Omit<Partial<Incident>, 'relatedProblem'> & { reporterId: number; assignedId?: number; relatedProblem?: number }) => {
    const response = await api.post<Incident>('/incidents', data);
    return response.data;
};

export const updateIncident = async (id: number, data: Omit<Partial<Incident>, 'relatedProblem'> & { assignedId?: number; relatedProblem?: number }) => {
    const response = await api.patch<Incident>(`/incidents/${id}`, data);
    return response.data;
};

export const deleteIncident = async (id: number) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
};
