import { JobDescription, ResumeData, AnalysisResult, OptimizedResume } from './types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Job Description Storage
export const saveJobDescription = (job: JobDescription): void => {
  const jobs = getJobDescriptions();
  jobs.push(job);
  localStorage.setItem('resume_analyzer_jobs', JSON.stringify(jobs));
};

export const getJobDescriptions = (): JobDescription[] => {
  const stored = localStorage.getItem('resume_analyzer_jobs');
  if (!stored) return [];
  
  try {
    const jobs = JSON.parse(stored);
    return jobs.map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt)
    }));
  } catch {
    return [];
  }
};

// Resume Storage
export const saveResume = (resume: ResumeData): void => {
  const resumes = getResumes();
  resumes.push(resume);
  localStorage.setItem('resume_analyzer_resumes', JSON.stringify(resumes));
};

export const getResumes = (): ResumeData[] => {
  const stored = localStorage.getItem('resume_analyzer_resumes');
  if (!stored) return [];
  
  try {
    const resumes = JSON.parse(stored);
    return resumes.map((resume: any) => ({
      ...resume,
      uploadedAt: new Date(resume.uploadedAt)
    }));
  } catch {
    return [];
  }
};

// Analysis Storage
export const saveAnalysis = (analysis: AnalysisResult): void => {
  const analyses = getAnalyses();
  analyses.push(analysis);
  localStorage.setItem('resume_analyzer_analyses', JSON.stringify(analyses));
};

export const getAnalyses = (): AnalysisResult[] => {
  const stored = localStorage.getItem('resume_analyzer_analyses');
  if (!stored) return [];
  
  try {
    const analyses = JSON.parse(stored);
    return analyses.map((analysis: any) => ({
      ...analysis,
      createdAt: new Date(analysis.createdAt)
    }));
  } catch {
    return [];
  }
};

// Optimized Resume Storage
export const saveOptimizedResume = (resume: OptimizedResume): void => {
  const resumes = getOptimizedResumes();
  resumes.push(resume);
  localStorage.setItem('resume_analyzer_optimized', JSON.stringify(resumes));
};

export const getOptimizedResumes = (): OptimizedResume[] => {
  const stored = localStorage.getItem('resume_analyzer_optimized');
  if (!stored) return [];
  
  try {
    const resumes = JSON.parse(stored);
    return resumes.map((resume: any) => ({
      ...resume,
      createdAt: new Date(resume.createdAt)
    }));
  } catch {
    return [];
  }
};