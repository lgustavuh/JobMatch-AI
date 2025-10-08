import { JobDescription, ResumeData, AnalysisResult, OptimizedResume, UserProfile } from './types';
import { extractJobData, JobExtractionInput, JobExtractionResult, JobExtractionError } from './job-extractor';

// Função para extrair texto de arquivos
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        if (file.type === 'application/pdf') {
          // Para PDF, usar uma biblioteca como pdf-parse ou similar
          // Por simplicidade, vamos simular a extração
          const text = await extractPDFText(arrayBuffer);
          resolve(text);
        } else if (file.type.includes('document') || file.type.includes('word')) {
          // Para DOCX, usar uma biblioteca como mammoth ou similar
          const text = await extractDOCXText(arrayBuffer);
          resolve(text);
        } else {
          reject(new Error('Tipo de arquivo não suportado'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Simulação de extração de PDF (em produção, usar pdf-parse)
async function extractPDFText(arrayBuffer: ArrayBuffer): Promise<string> {
  // Simulação - retorna texto genérico para demonstração
  // Em produção, usar biblioteca específica para extrair texto real do PDF
  return `Currículo em PDF carregado com sucesso.

Este é um texto simulado extraído do arquivo PDF.
Para ver dados reais, complete seu perfil na aba "Perfil".

O sistema tentará extrair informações automaticamente quando possível,
mas recomendamos preencher manualmente para maior precisão.`;
}

// Simulação de extração de DOCX (em produção, usar mammoth)
async function extractDOCXText(arrayBuffer: ArrayBuffer): Promise<string> {
  // Simulação - retorna texto genérico para demonstração
  // Em produção, usar biblioteca específica para extrair texto real do DOCX
  return `Currículo em DOCX carregado com sucesso.

Este é um texto simulado extraído do arquivo DOCX.
Para ver dados reais, complete seu perfil na aba "Perfil".

O sistema tentará extrair informações automaticamente quando possível,
mas recomendamos preencher manualmente para maior precisão.`;
}

// Função para analisar descrição de vaga (com suporte a URL)
export async function parseJobDescription(input: string): Promise<Partial<JobDescription>> {
  try {
    // Verificar se é uma URL
    if (isValidUrl(input)) {
      // Usar o extrator de vagas para URLs
      const extractionInput: JobExtractionInput = {
        url: input,
        idioma: 'pt-BR'
      };
      
      const result = await extractJobData(extractionInput);
      
      if ('erro' in result) {
        // Se falhou a extração da URL, usar como texto normal
        return parseJobDescriptionText(input);
      }
      
      // Converter resultado da extração para formato JobDescription
      return convertExtractionToJobDescription(result);
    } else {
      // Processar como texto normal
      return parseJobDescriptionText(input);
    }
  } catch (error) {
    console.error('Erro ao processar descrição da vaga:', error);
    return parseJobDescriptionText(input);
  }
}

// Função auxiliar para validar URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Converter resultado da extração para JobDescription
function convertExtractionToJobDescription(extraction: JobExtractionResult): Partial<JobDescription> {
  const skills = [
    ...extraction.vaga.requisitos.competencias_tecnicas,
    ...extraction.vaga.requisitos.competencias_comportamentais
  ];

  const requirements = [
    ...extraction.vaga.responsabilidades,
    ...extraction.vaga.requisitos.formacao,
    ...(extraction.vaga.requisitos.experiencia ? [extraction.vaga.requisitos.experiencia] : [])
  ];

  return {
    title: extraction.vaga.titulo,
    company: extraction.vaga.empresa.nome,
    description: extraction.resumo_curto,
    requirements,
    skills,
    url: extraction.fonte.url
  };
}

// Função para processar texto da vaga
async function parseJobDescriptionText(jobText: string): Promise<Partial<JobDescription>> {
  try {
    const response = await fetch('/api/parse-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobText }),
    });

    if (!response.ok) {
      console.error(`API parse-job retornou status ${response.status}`);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    
    // Se a API retornou um erro estruturado
    if (result.erro) {
      console.error('API retornou erro:', result.mensagem);
      throw new Error(result.mensagem || 'Erro no processamento da vaga');
    }
    
    // Validar se o resultado tem a estrutura esperada
    if (!result.title && !result.company) {
      console.error('Resultado da API não tem estrutura esperada:', result);
      throw new Error('Resposta da API inválida');
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao fazer parsing da vaga:', error);
    
    // Fallback: parsing básico local
    const fallbackResult = {
      title: extractTitle(jobText),
      company: extractCompany(jobText),
      description: jobText.substring(0, 500),
      requirements: extractRequirements(jobText),
      skills: extractSkills(jobText)
    };
    
    console.log('Usando fallback parsing:', fallbackResult);
    return fallbackResult;
  }
}

// Funções auxiliares para parsing básico
function extractTitle(text: string): string {
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (firstLine && firstLine.length < 100) {
    return firstLine;
  }
  
  // Procurar por padrões comuns de título
  const titlePatterns = [
    /vaga:?\s*(.+)/i,
    /cargo:?\s*(.+)/i,
    /posição:?\s*(.+)/i,
    /oportunidade:?\s*(.+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Vaga de Emprego';
}

function extractCompany(text: string): string {
  const companyPatterns = [
    /empresa:?\s*(.+)/i,
    /companhia:?\s*(.+)/i,
    /organização:?\s*(.+)/i,
    /cliente:?\s*(.+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().split('\n')[0];
    }
  }
  
  return 'Empresa';
}

function extractRequirements(text: string): string[] {
  const requirements: string[] = [];
  const lines = text.split('\n');
  
  let inRequirementsSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detectar início da seção de requisitos
    if (/requisitos|requirements|qualificações|experiência|formação/i.test(trimmedLine)) {
      inRequirementsSection = true;
      continue;
    }
    
    // Detectar fim da seção
    if (inRequirementsSection && /benefícios|salário|contato|sobre|empresa/i.test(trimmedLine)) {
      inRequirementsSection = false;
    }
    
    // Extrair requisitos
    if (inRequirementsSection && (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
      requirements.push(trimmedLine.substring(1).trim());
    }
  }
  
  return requirements;
}

function extractSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'C#', 'PHP',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'REST', 'GraphQL', 'Agile', 'Scrum', 'TDD', 'CI/CD'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of commonSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  return foundSkills;
}

// Função para analisar compatibilidade
export async function analyzeResumeCompatibility(
  resume: ResumeData,
  job: JobDescription
): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze-compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: resume.extractedText,
        jobDescription: job.description,
        jobRequirements: job.requirements,
        jobSkills: job.skills
      }),
    });

    if (!response.ok) {
      throw new Error('Erro na API de análise');
    }

    const result = await response.json();
    
    return {
      id: `analysis-${Date.now()}`,
      resumeId: resume.id,
      jobId: job.id,
      compatibilityScore: result.compatibilityScore || 75,
      strengths: result.strengths || [
        'Experiência relevante na área',
        'Conhecimento das tecnologias principais',
        'Formação adequada para a posição'
      ],
      weaknesses: result.weaknesses || [
        'Falta experiência em algumas tecnologias específicas',
        'Poderia destacar mais projetos práticos'
      ],
      improvements: result.improvements || [
        'Adicionar mais detalhes sobre projetos realizados',
        'Destacar resultados quantificáveis',
        'Incluir certificações relevantes'
      ],
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Erro na análise de compatibilidade:', error);
    
    // Fallback: análise básica local
    return {
      id: `analysis-${Date.now()}`,
      resumeId: resume.id,
      jobId: job.id,
      compatibilityScore: calculateBasicCompatibility(resume, job),
      strengths: [
        'Currículo bem estruturado',
        'Experiência profissional relevante',
        'Formação adequada'
      ],
      weaknesses: [
        'Algumas habilidades específicas podem ser melhoradas',
        'Poderia incluir mais detalhes sobre conquistas'
      ],
      improvements: [
        'Destacar mais resultados quantificáveis',
        'Incluir palavras-chave da vaga',
        'Adicionar seção de projetos relevantes'
      ],
      createdAt: new Date()
    };
  }
}

// Cálculo básico de compatibilidade
function calculateBasicCompatibility(resume: ResumeData, job: JobDescription): number {
  const resumeText = resume.extractedText.toLowerCase();
  let matches = 0;
  const total = job.skills.length;
  
  for (const skill of job.skills) {
    if (resumeText.includes(skill.toLowerCase())) {
      matches++;
    }
  }
  
  return Math.round((matches / Math.max(total, 1)) * 100);
}

// Função para gerar currículo otimizado
export async function generateOptimizedResume(
  resume: ResumeData,
  job: JobDescription,
  analysis: AnalysisResult,
  userProfile?: UserProfile
): Promise<string> {
  try {
    const response = await fetch('/api/generate-optimized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: resume.extractedText,
        jobTitle: job.title,
        jobCompany: job.company,
        jobRequirements: job.requirements,
        jobSkills: job.skills,
        analysisStrengths: analysis.strengths,
        analysisImprovements: analysis.improvements,
        userProfile
      }),
    });

    if (!response.ok) {
      throw new Error('Erro na API de geração');
    }

    const result = await response.json();
    return result.optimizedResume || generateBasicOptimizedResume(resume, job, userProfile);
  } catch (error) {
    console.error('Erro na geração do currículo otimizado:', error);
    return generateBasicOptimizedResume(resume, job, userProfile);
  }
}

// Geração básica de currículo otimizado
function generateBasicOptimizedResume(
  resume: ResumeData,
  job: JobDescription,
  userProfile?: UserProfile
): string {
  const profile = userProfile || {};
  
  return `
=== CURRÍCULO OTIMIZADO PARA: ${job.title} ===

=== DADOS PESSOAIS ===
Nome: ${profile.fullName || 'Seu Nome'}
E-mail: ${profile.email || 'seu@email.com'}
Telefone: ${profile.phone || '(11) 99999-9999'}
Endereço: ${profile.address || 'Sua Cidade, UF'}

=== OBJETIVO PROFISSIONAL ===
Profissional experiente buscando oportunidade como ${job.title} na ${job.company}, 
com foco em aplicar conhecimentos técnicos e contribuir para o crescimento da equipe.

=== EXPERIÊNCIA PROFISSIONAL ===
${profile.experience || 'Sua experiência profissional aqui...'}

=== FORMAÇÃO ACADÊMICA ===
${profile.education || 'Sua formação acadêmica aqui...'}

=== HABILIDADES TÉCNICAS ===
${profile.skills?.join(', ') || job.skills.join(', ')}

=== CERTIFICAÇÕES ===
${profile.certifications?.join('\n• ') || '• Suas certificações aqui...'}

=== PROJETOS RELEVANTES ===
${profile.projects?.join('\n• ') || '• Seus projetos aqui...'}

=== DIFERENCIAIS ===
• Experiência alinhada com os requisitos da vaga
• Conhecimento das principais tecnologias solicitadas
• Capacidade de trabalhar em equipe e entregar resultados
• Foco em qualidade e melhoria contínua

---
Currículo otimizado para a vaga de ${job.title} - ${job.company}
Gerado em: ${new Date().toLocaleDateString('pt-BR')}
  `.trim();
}

// Função para extrair perfil do currículo - CORRIGIDA: Não retorna dados simulados
export async function extractProfileFromResume(resumeText: string): Promise<Partial<UserProfile> | null> {
  try {
    const response = await fetch('/api/extract-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) {
      throw new Error('Erro na API de extração de perfil');
    }

    const result = await response.json();
    return result.profile;
  } catch (error) {
    console.error('Erro na extração do perfil:', error);
    
    // Fallback: extração básica local - APENAS dados reais do texto
    return extractBasicProfile(resumeText);
  }
}

// Extração básica de perfil - CORRIGIDA: Só extrai dados reais do texto
function extractBasicProfile(text: string): Partial<UserProfile> | null {
  const profile: Partial<UserProfile> = {};
  
  // Verificar se o texto contém dados reais (não é simulação)
  if (text.includes('Este é um texto simulado') || text.includes('Currículo em PDF carregado') || text.includes('Currículo em DOCX carregado')) {
    // Se é texto simulado, não extrair nada
    return null;
  }
  
  // Extrair nome (primeira linha ou padrão comum)
  const nameMatch = text.match(/^([A-ZÁÊÇÕ][a-záêçõ]+(?:\s+[A-ZÁÊÇÕ][a-záêçõ]+)+)/m);
  if (nameMatch) {
    profile.fullName = nameMatch[1].trim();
  }
  
  // Extrair email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    profile.email = emailMatch[1];
  }
  
  // Extrair telefone
  const phoneMatch = text.match(/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/);
  if (phoneMatch) {
    profile.phone = phoneMatch[0];
  }
  
  // Extrair habilidades
  const skillsSection = text.match(/(?:habilidades|competências|skills)[:\s]*([^]*?)(?:\n\n|\n[A-Z]|$)/i);
  if (skillsSection) {
    const skills = skillsSection[1]
      .split(/[,\n•-]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 2 && s.length < 50);
    
    if (skills.length > 0) {
      profile.skills = skills;
    }
  }
  
  return Object.keys(profile).length > 0 ? profile : null;
}