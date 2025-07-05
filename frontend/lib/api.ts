// lib/api.ts - Complete API file with types and functions

import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Django backend URL

// ✅ Types define karo yahi pe
export interface User {
  id: string | number;
  email: string;
  username?: string;
  created_at?: string;
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  priority: string; // "Low", "Medium", "High", "Critical", "Minimal"
  category?: string;
  category_id?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'Pending' | 'In Progress' | 'Completed';
  deadline?: string;
  estimated_duration?: number;
  duration_minutes?: number;
  user: number;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
}

export interface ContextEntry {
  id: string | number;
  type: 'email' | 'message' | 'note' | 'document';
  content: string;
  source?: string;
  user: number;
  created_at: string;
}

// ✅ Task API Functions
export const getTasks = async (userId: number): Promise<Task[]> => {
  const response = await axios.get(`${API_BASE_URL}/tasks/?user_id=${userId}`);
  return response.data;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await axios.post(`${API_BASE_URL}/tasks/`, taskData);
  return response.data;
};

export const updateTask = async (id: number, taskData: Partial<Task>): Promise<Task> => {
  const response = await axios.put(`${API_BASE_URL}/tasks/${id}/`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/tasks/${id}/`);
  return response.data;
};

// ✅ Context API Functions
export const getContexts = async (): Promise<ContextEntry[]> => {
  const response = await axios.get(`${API_BASE_URL}/contexts/`);
  return response.data;
};

export const createContext = async (contextData: Partial<ContextEntry>): Promise<ContextEntry> => {
  const response = await axios.post(`${API_BASE_URL}/contexts/`, contextData);
  return response.data;
};

// ✅ Category API Functions
export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${API_BASE_URL}/categories/`);
  return response.data;
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const response = await axios.post(`${API_BASE_URL}/categories/`, categoryData);
  return response.data;
};

// ✅ Error handling helper
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.message || 'API request failed');
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.request);
    throw new Error('Network error. Please check your connection.');
  } else {
    // Other error
    console.error('Error:', error.message);
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// ✅ Axios interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);