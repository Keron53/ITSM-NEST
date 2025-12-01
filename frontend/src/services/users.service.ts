import api from './api';
import type { User } from '../types';

export const getUsers = async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export const getUser = async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
};

export const createUser = async (data: Partial<User>) => {
    const response = await api.post<User>('/users', data);
    return response.data;
};

export const updateUser = async (id: number, data: Partial<User>) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};
