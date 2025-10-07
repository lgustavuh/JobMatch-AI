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