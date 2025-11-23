import axios from 'axios';
import type { Token, JobDescription, Question, Response } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authAPI = {
  register: async (email: string, password: string): Promise<Token> => {
    const response = await api.post<Token>('/api/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<Token> => {
    const response = await api.post<Token>('/api/auth/login', { email, password });
    return response.data;
  },
};

// Job Descriptions
export const jobDescriptionsAPI = {
  create: async (companyName: string, jobTitle: string, descriptionText: string): Promise<JobDescription> => {
    const response = await api.post<JobDescription>('/api/job-descriptions', {
      company_name: companyName,
      job_title: jobTitle,
      description_text: descriptionText,
    });
    return response.data;
  },

  list: async (): Promise<JobDescription[]> => {
    const response = await api.get<JobDescription[]>('/api/job-descriptions');
    return response.data;
  },

  getQuestions: async (jobDescriptionId: string): Promise<Question[]> => {
    const response = await api.get<Question[]>(`/api/job-descriptions/${jobDescriptionId}/questions`);
    return response.data;
  },
};

// Responses
export const responsesAPI = {
  submit: async (questionId: string, audioFile: File): Promise<Response> => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await api.post<Response>(`/api/questions/${questionId}/responses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async (questionId: string): Promise<Response[]> => {
    const response = await api.get<Response[]>(`/api/questions/${questionId}/responses`);
    return response.data;
  },
};

export default api;
