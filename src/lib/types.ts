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
  jobId: string;
  resumeId: string;
  compatibilityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  missingSkills: string[];
  analyzedAt: Date;
}

export interface OptimizedResume {
  id: string;
  originalResumeId: string;
  jobId: string;
  content: string;
  improvements: string[];
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}