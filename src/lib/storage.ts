import { JobDescription, ResumeData, AnalysisResult, OptimizedResume, UserProfile } from './types';

const STORAGE_KEYS = {
  JOBS: 'resume-analyzer-jobs',
  RESUMES: 'resume-analyzer-resumes',
  ANALYSES: 'resume-analyzer-analyses',
  OPTIMIZED_RESUMES: 'resume-analyzer-optimized',
  USER_PROFILE: 'resume-analyzer-profile'
};

// Job Description Storage
export const saveJobDescription = (job: JobDescription): void => {
  const jobs = getJobDescriptions();
  const updatedJobs = [...jobs.filter(j => j.id !== job.id), job];
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
};

export const getJobDescriptions = (): JobDescription[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.JOBS);
  return stored ? JSON.parse(stored) : [];
};

export const getJobById = (id: string): JobDescription | null => {
  const jobs = getJobDescriptions();
  return jobs.find(job => job.id === id) || null;
};

// Resume Storage
export const saveResume = (resume: ResumeData): void => {
  const resumes = getResumes();
  const updatedResumes = [...resumes.filter(r => r.id !== resume.id), resume];
  localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(updatedResumes));
};

export const getResumes = (): ResumeData[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.RESUMES);
  return stored ? JSON.parse(stored) : [];
};

export const getResumeById = (id: string): ResumeData | null => {
  const resumes = getResumes();
  return resumes.find(resume => resume.id === id) || null;
};

// Analysis Storage
export const saveAnalysis = (analysis: AnalysisResult): void => {
  const analyses = getAnalyses();
  const updatedAnalyses = [...analyses.filter(a => a.id !== analysis.id), analysis];
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(updatedAnalyses));
};

export const getAnalyses = (): AnalysisResult[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYSES);
  return stored ? JSON.parse(stored) : [];
};

export const getAnalysisById = (id: string): AnalysisResult | null => {
  const analyses = getAnalyses();
  return analyses.find(analysis => analysis.id === id) || null;
};

// Optimized Resume Storage
export const saveOptimizedResume = (resume: OptimizedResume): void => {
  const resumes = getOptimizedResumes();
  const updatedResumes = [...resumes.filter(r => r.id !== resume.id), resume];
  localStorage.setItem(STORAGE_KEYS.OPTIMIZED_RESUMES, JSON.stringify(updatedResumes));
};

export const getOptimizedResumes = (): OptimizedResume[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.OPTIMIZED_RESUMES);
  return stored ? JSON.parse(stored) : [];
};

// User Profile Storage
export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return stored ? JSON.parse(stored) : null;
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};