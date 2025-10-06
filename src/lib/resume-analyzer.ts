import { JobDescription, ResumeData, AnalysisResult } from './types';

// Simulated AI analysis - In a real app, this would call an AI service
export const analyzeResumeCompatibility = async (
  resume: ResumeData,
  job: JobDescription
): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const resumeText = resume.extractedText.toLowerCase();
  const jobRequirements = job.requirements.join(' ').toLowerCase();
  const jobSkills = job.skills.join(' ').toLowerCase();
  const jobDescription = job.description.toLowerCase();

  // Calculate compatibility score based on keyword matching
  const allJobKeywords = [...job.requirements, ...job.skills, job.title]
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  const uniqueKeywords = [...new Set(allJobKeywords)];
  const matchedKeywords = uniqueKeywords.filter(keyword => 
    resumeText.includes(keyword)
  );

  const compatibilityScore = Math.min(
    Math.round((matchedKeywords.length / uniqueKeywords.length) * 100),
    95
  );

  // Generate strengths based on matched keywords
  const strengths = [
    ...matchedKeywords.slice(0, 5).map(keyword => 
      `Experiência relevante em ${keyword}`
    ),
    'Perfil alinhado com os requisitos da vaga',
    'Histórico profissional consistente'
  ].slice(0, 4);

  // Generate weaknesses based on missing keywords
  const missingKeywords = uniqueKeywords.filter(keyword => 
    !resumeText.includes(keyword)
  );

  const weaknesses = [
    ...missingKeywords.slice(0, 3).map(keyword => 
      `Falta evidência de experiência em ${keyword}`
    ),
    'Algumas competências técnicas poderiam ser mais detalhadas',
    'Objetivos profissionais poderiam ser mais específicos'
  ].slice(0, 4);

  // Generate improvement suggestions
  const improvements = [
    'Adicione mais detalhes sobre projetos específicos',
    'Inclua métricas e resultados quantificáveis',
    'Destaque certificações relevantes',
    'Personalize o resumo profissional para a vaga',
    'Adicione palavras-chave específicas da área'
  ].slice(0, 5);

  return {
    id: Date.now().toString(),
    jobId: job.id,
    resumeId: resume.id,
    compatibilityScore,
    strengths,
    weaknesses,
    improvements,
    missingSkills: missingKeywords.slice(0, 5),
    analyzedAt: new Date()
  };
};

// Extract text from file (simplified version)
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (file.type === 'application/pdf') {
        // In a real app, you'd use a PDF parsing library
        resolve(`[PDF Content] ${file.name} - Conteúdo extraído do PDF. Em uma implementação real, seria usado uma biblioteca como PDF.js para extrair o texto completo.`);
      } else if (file.type.includes('document') || file.type.includes('word')) {
        // In a real app, you'd use a DOCX parsing library
        resolve(`[DOCX Content] ${file.name} - Conteúdo extraído do DOCX. Em uma implementação real, seria usado uma biblioteca como mammoth.js para extrair o texto completo.`);
      } else {
        resolve(result);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsText(file);
  });
};

// Parse job description from URL or text
export const parseJobDescription = async (input: string): Promise<Partial<JobDescription>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const isUrl = input.startsWith('http');
  
  if (isUrl) {
    // In a real app, you'd scrape the job posting
    return {
      title: 'Desenvolvedor Full Stack',
      company: 'Tech Company',
      description: 'Estamos procurando um desenvolvedor full stack experiente para se juntar à nossa equipe. O candidato ideal terá experiência em desenvolvimento web moderno e será responsável por criar aplicações escaláveis.',
      requirements: [
        'Experiência com React e Node.js',
        'Conhecimento em bancos de dados SQL',
        'Experiência com Git e metodologias ágeis',
        'Inglês intermediário'
      ],
      skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'Git'],
      url: input
    };
  } else {
    // Parse text description
    const lines = input.split('\n').filter(line => line.trim());
    const title = lines[0] || 'Vaga de Emprego';
    const company = lines[1] || 'Empresa';
    
    // Extract skills and requirements (simplified)
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS', 'Docker'];
    const foundSkills = commonSkills.filter(skill => 
      input.toLowerCase().includes(skill.toLowerCase())
    );
    
    return {
      title,
      company,
      description: input,
      requirements: [
        'Experiência na área',
        'Conhecimento técnico relevante',
        'Boa comunicação',
        'Trabalho em equipe'
      ],
      skills: foundSkills.length > 0 ? foundSkills : ['Habilidades técnicas', 'Comunicação']
    };
  }
};

// Generate optimized resume content
export const generateOptimizedResume = async (
  originalResume: ResumeData,
  job: JobDescription,
  analysis: AnalysisResult
): Promise<string> => {
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  const optimizedContent = `
CURRÍCULO OTIMIZADO PARA: ${job.title} - ${job.company}

=== RESUMO PROFISSIONAL ===
Profissional experiente com foco em ${job.skills.slice(0, 3).join(', ')} e forte alinhamento com os requisitos da posição. Histórico comprovado de entrega de resultados e adaptabilidade às necessidades do mercado.

=== COMPETÊNCIAS TÉCNICAS ===
${job.skills.map(skill => `• ${skill}`).join('\n')}

=== EXPERIÊNCIA PROFISSIONAL ===
[Baseado no currículo original com otimizações]
• Experiência relevante destacando projetos relacionados aos requisitos da vaga
• Resultados quantificáveis e métricas de performance
• Tecnologias e metodologias alinhadas com a posição

=== FORMAÇÃO ACADÊMICA ===
[Informações educacionais relevantes]

=== CERTIFICAÇÕES E CURSOS ===
• Certificações relevantes para ${job.title}
• Cursos complementares na área

=== MELHORIAS IMPLEMENTADAS ===
${analysis.improvements.map(improvement => `• ${improvement}`).join('\n')}

=== PALAVRAS-CHAVE OTIMIZADAS ===
${job.skills.join(' • ')}

---
Currículo otimizado automaticamente com base na análise de compatibilidade.
Score de compatibilidade: ${analysis.compatibilityScore}%
`;

  return optimizedContent;
};