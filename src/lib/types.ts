export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  url?: string;
  createdAt: Date;
}

export interface ResumeData {
  id: string;
  fileName: string;
  content: string;
  extractedText: string;
  uploadedAt: Date;
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobId: string;
  compatibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  createdAt: Date;
}

export interface OptimizedResume {
  id: string;
  originalResumeId: string;
  jobId: string;
  content: string;
  improvements: string[];
  createdAt: Date;
}

// Novas interfaces para o sistema de usuários
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  emailConfirmed: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}