import api from './api';
import type { Problem } from '../types';

export const getProblems = async () => {
    const response = await api.get<Problem[]>('/problems');
    return response.data;
};

export const getProblem = async (id: number) => {
    const response = await api.get<Problem>(`/problems/${id}`);
    return response.data;
};

export const createProblem = async (data: Partial<Problem> & { reporterId: number }) => {
    const response = await api.post<Problem>('/problems', data);
    return response.data;
};

export const updateProblem = async (id: number, data: Partial<Problem> & { assignedId?: number }) => {
    const response = await api.patch<Problem>(`/problems/${id}`, data);
    return response.data;
};

export const deleteProblem = async (id: number) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
};
