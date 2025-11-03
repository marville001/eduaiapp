import api from './index';

// Types
export interface Subject {
  id: number;
  subjectId: string;
  studyLevelId: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  studyLevelId: number;
  name: string;
  description?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// API endpoints
export const subjectApi = {
  // Get all subjects with optional study level filter
  getAll: async (params?: { studyLevelId?: number }): Promise<Subject[]> => {
    const response = await api.get('/subjects', { params });
    return response.data?.data;
  },

  // Get subject by ID
  getById: async (id: string): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data?.data;
  },

  // Create subject
  create: async (data: CreateSubjectDto): Promise<Subject> => {
    const response = await api.post('/subjects', data);
    return response.data?.data;
  },

  // Update subject
  update: async (id: string, data: UpdateSubjectDto): Promise<Subject> => {
    const response = await api.patch(`/subjects/${id}`, data);
    return response.data?.data;
  },

  // Delete subject
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};
