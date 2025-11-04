import api from './index';

// Types
export interface Subject {
  id: number;
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentSubjectId?: number;
  aiPrompt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTags?: string[];
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
  subSubjects?: Subject[];
  parentSubject?: Subject;
}

export interface CreateSubjectDto {
  name: string;
  slug?: string;
  description?: string;
  aiPrompt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTags?: string[];
  seoImage?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  aiPrompt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTags?: string[];
  seoImage?: string;
}

// API endpoints
export const subjectApi = {
  // Get all subjects
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get('/subjects');
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
