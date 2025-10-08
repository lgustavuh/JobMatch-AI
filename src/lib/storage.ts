import { JobDescription, ResumeData, AnalysisResult, OptimizedResume, User, UserProfile, RegisterData } from './types';
import { supabase } from './supabase';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função auxiliar para truncar strings
const truncateString = (str: string | null | undefined, maxLength: number): string => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

// User Management
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: truncateString(userData.email, 255),
        name: truncateString(userData.name, 255),
        phone: truncateString(userData.phone, 50),
        address: truncateString(userData.address, 500),
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

export const loginUser = async (email: string): Promise<User | null> => {
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

// User Profile Management - CORRIGIDO: Usar UPDATE/INSERT em vez de UPSERT
export const saveUserProfile = async (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile | null> => {
  try {
    // Primeiro, verificar se já existe um perfil para este usuário
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', profile.userId)
      .single();

    let data, error;

    if (existingProfile) {
      // Perfil existe - fazer UPDATE
      const result = await supabase
        .from('user_profiles')
        .update({
          full_name: truncateString(profile.fullName, 255),
          email: truncateString(profile.email, 255),
          phone: truncateString(profile.phone, 50),
          address: truncateString(profile.address, 500),
          education: truncateString(profile.education, 1000),
          experience: truncateString(profile.experience, 2000),
          skills: profile.skills,
          certifications: profile.certifications,
          projects: profile.projects,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.userId)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Perfil não existe - fazer INSERT
      const result = await supabase
        .from('user_profiles')
        .insert([{
          user_id: profile.userId,
          full_name: truncateString(profile.fullName, 255),
          email: truncateString(profile.email, 255),
          phone: truncateString(profile.phone, 50),
          address: truncateString(profile.address, 500),
          education: truncateString(profile.education, 1000),
          experience: truncateString(profile.experience, 2000),
          skills: profile.skills,
          certifications: profile.certifications,
          projects: profile.projects,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

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
    console.error('Erro ao salvar perfil:', error?.message || error || 'Erro desconhecido');
    return null;
  }
};

// MELHORADO: Carregar perfil salvo do usuário
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

// NOVA FUNÇÃO: Verificar se perfil precisa ser atualizado baseado em novo currículo
export const shouldUpdateProfile = (currentProfile: UserProfile | null, newResumeData: unknown): boolean => {
  if (!currentProfile) return true; // Se não tem perfil, sempre atualizar
  
  // Verificar se dados essenciais estão vazios no perfil atual
  const hasEmptyEssentialData = !currentProfile.fullName || 
                                !currentProfile.email || 
                                !currentProfile.phone || 
                                !currentProfile.address ||
                                !currentProfile.education ||
                                !currentProfile.experience ||
                                !currentProfile.skills?.length;
  
  return hasEmptyEssentialData;
};

// Job Description Storage - CORRIGIDO: Truncar campos para evitar erro de tamanho
export const saveJobDescription = async (job: JobDescription, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('job_descriptions')
      .insert([{
        id: job.id,
        user_id: userId,
        title: truncateString(job.title, 255),
        company: truncateString(job.company, 255),
        description: truncateString(job.description, 2000), // Assumindo que description pode ser maior
        requirements: job.requirements,
        skills: job.skills,
        url: truncateString(job.url, 500)
      }]);

    if (error) {
      console.error('Erro ao salvar vaga no Supabase:', error);
      throw error;
    }
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
      return jobs.map((job: JobDescription) => ({
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

// Resume Storage - CORRIGIDO: Truncar campos para evitar erro de tamanho
export const saveResume = async (resume: ResumeData, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .insert([{
        id: resume.id,
        user_id: userId,
        file_name: truncateString(resume.fileName, 255),
        content: truncateString(resume.content, 1000),
        extracted_text: truncateString(resume.extractedText, 5000) // Texto extraído pode ser grande
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
      return resumes.map((resume: ResumeData) => ({
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

// Analysis Storage - CORRIGIDO: Truncar campos para evitar erro de tamanho
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
      return analyses.map((analysis: AnalysisResult) => ({
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

// Optimized Resume Storage - CORRIGIDO: Truncar campos para evitar erro de tamanho
export const saveOptimizedResume = async (resume: OptimizedResume, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('optimized_resumes')
      .insert([{
        id: resume.id,
        user_id: userId,
        original_resume_id: resume.originalResumeId,
        job_id: resume.jobId,
        content: truncateString(resume.content, 5000), // Conteúdo pode ser grande
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
      return resumes.map((resume: OptimizedResume) => ({
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