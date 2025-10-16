import api from './axios';
import type { CreateUserInput, User } from '../types'; 

export const getUsers = () => api.get<User[]>('/users');

export const getUser = (id: string) => api.get<User>(`/users/${id}`);

export const getUserById = (id: string) => api.get<User>(`/users/${id}`);
export const createUser = (user: CreateUserInput) => api.post<User>('/users', user);

export type UpdateUserInput = { id: string; user: Partial<User> };
export const updateUser = ({ id, user }: UpdateUserInput) => 
  api.put(`/users/${id}`, user);

export type DeleteUserInput = { id: string };
export const deleteUser = ({ id }: DeleteUserInput) => 
  api.delete(`/users/${id}`);
