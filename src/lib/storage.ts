import { JobDescription, ResumeData, AnalysisResult, OptimizedResume, User, UserProfile, RegisterData } from './types';
import { supabase } from './supabase';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User Management
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        email_confirmed: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Simular envio de email de confirmação
    console.log(`Email de confirmação enviado para: ${userData.email}`);

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      createdAt: new Date(data.created_at),
      emailConfirmed: data.email_confirmed
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // Simulação de login - em produção, usar Supabase Auth
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      createdAt: new Date(data.created_at),
      emailConfirmed: data.email_confirmed
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('current_user');
  if (!stored) return null;
  
  try {
    const user = JSON.parse(stored);
    return {
      ...user,
      createdAt: new Date(user.createdAt)
    };
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('current_user');
};

// User Profile Management
export const saveUserProfile = async (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{
        user_id: profile.userId,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        education: profile.education,
        experience: profile.experience,
        skills: profile.skills,
        certifications: profile.certifications,
        projects: profile.projects,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      certifications: data.certifications,
      projects: data.projects,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      certifications: data.certifications,
      projects: data.projects,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

// Job Description Storage
export const saveJobDescription = async (job: JobDescription, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('job_descriptions')
      .insert([{
        id: job.id,
        user_id: userId,
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        url: job.url
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar vaga:', error);
    // Fallback para localStorage
    const jobs = getJobDescriptions();
    jobs.push(job);
    localStorage.setItem('resume_analyzer_jobs', JSON.stringify(jobs));
  }
};

export const getJobDescriptions = (userId?: string): JobDescription[] => {
  // Fallback para localStorage se não houver userId
  if (!userId) {
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
  }

  // TODO: Implementar busca no Supabase quando necessário
  return [];
};

// Resume Storage
export const saveResume = async (resume: ResumeData, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .insert([{
        id: resume.id,
        user_id: userId,
        file_name: resume.fileName,
        content: resume.content,
        extracted_text: resume.extractedText
      }]);

    if (error) {
      console.warn('Supabase não disponível, usando localStorage:', error.message);
      throw error;
    }
  } catch (error) {
    // Fallback para localStorage
    const resumes = getResumes();
    resumes.push(resume);
    localStorage.setItem('resume_analyzer_resumes', JSON.stringify(resumes));
  }
};

export const getResumes = (userId?: string): ResumeData[] => {
  // Fallback para localStorage se não houver userId
  if (!userId) {
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
  }

  // TODO: Implementar busca no Supabase quando necessário
  return [];
};

// Analysis Storage
export const saveAnalysis = async (analysis: AnalysisResult, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('analyses')
      .insert([{
        id: analysis.id,
        user_id: userId,
        resume_id: analysis.resumeId,
        job_id: analysis.jobId,
        compatibility_score: analysis.compatibilityScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        improvements: analysis.improvements
      }]);

    if (error) {
      console.warn('Supabase não disponível, usando localStorage:', error.message);
      throw error;
    }
  } catch (error) {
    // Fallback para localStorage
    const analyses = getAnalyses();
    analyses.push(analysis);
    localStorage.setItem('resume_analyzer_analyses', JSON.stringify(analyses));
  }
};

export const getAnalyses = (userId?: string): AnalysisResult[] => {
  // Fallback para localStorage se não houver userId
  if (!userId) {
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
  }

  // TODO: Implementar busca no Supabase quando necessário
  return [];
};

// Optimized Resume Storage
export const saveOptimizedResume = async (resume: OptimizedResume, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('optimized_resumes')
      .insert([{
        id: resume.id,
        user_id: userId,
        original_resume_id: resume.originalResumeId,
        job_id: resume.jobId,
        content: resume.content,
        improvements: resume.improvements
      }]);

    if (error) {
      console.warn('Supabase não disponível, usando localStorage:', error.message);
      throw error;
    }
  } catch (error) {
    // Fallback para localStorage
    const resumes = getOptimizedResumes();
    resumes.push(resume);
    localStorage.setItem('resume_analyzer_optimized', JSON.stringify(resumes));
  }
};

export const getOptimizedResumes = (userId?: string): OptimizedResume[] => {
  // Fallback para localStorage se não houver userId
  if (!userId) {
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
  }

  // TODO: Implementar busca no Supabase quando necessário
  return [];
};