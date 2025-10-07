import { JobDescription, ResumeData, AnalysisResult, UserProfile } from './types';
import { generateId } from './storage';

// Simular extração de texto de arquivo
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // Simulação de extração de texto
    setTimeout(() => {
      resolve(`Texto extraído do arquivo: ${file.name}\n\nEste é um exemplo de texto extraído de um currículo. Em uma implementação real, aqui seria usado uma biblioteca como PDF.js ou similar para extrair o texto real do arquivo.`);
    }, 1000);
  });
};

// Nova função para extrair dados do perfil do currículo
export const extractProfileFromResume = async (resumeText: string): Promise<Partial<UserProfile>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulação de extração de dados do currículo
      const profileData: Partial<UserProfile> = {};
      
      // Extrair nome (primeira linha ou padrão comum)
      const nameMatch = resumeText.match(/^([A-ZÁÊÇÕ][a-záêçõ\s]+)/m);
      if (nameMatch) {
        profileData.fullName = nameMatch[1].trim();
      }
      
      // Extrair email
      const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        profileData.email = emailMatch[1];
      }
      
      // Extrair telefone
      const phoneMatch = resumeText.match(/(\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{2}\s?\d{4,5}-?\d{4})/);
      if (phoneMatch) {
        profileData.phone = phoneMatch[1];
      }
      
      // Extrair endereço (procurar por padrões comuns)
      const addressMatch = resumeText.match(/(Rua|Av\.|Avenida|R\.).+?(?=\n|Email|Telefone|$)/i);
      if (addressMatch) {
        profileData.address = addressMatch[0].trim();
      }
      
      // Extrair educação
      const educationPatterns = [
        /(?:Formação|Educação|Graduação)[\s\S]*?(?=\n\n|Experiência|Habilidades|$)/i,
        /(?:Bacharel|Tecnólogo|Mestre|Doutor).*?(?=\n|$)/gi
      ];
      
      for (const pattern of educationPatterns) {
        const match = resumeText.match(pattern);
        if (match) {
          profileData.education = match[0].replace(/^(Formação|Educação|Graduação)[\s:]*/, '').trim();
          break;
        }
      }
      
      // Extrair experiência
      const experienceMatch = resumeText.match(/(?:Experiência|Histórico)[\s\S]*?(?=\n\n|Habilidades|Formação|$)/i);
      if (experienceMatch) {
        profileData.experience = experienceMatch[0].replace(/^(Experiência|Histórico)[\s:]*/, '').trim();
      }
      
      // Extrair habilidades
      const skillsSection = resumeText.match(/(?:Habilidades|Skills|Competências)[\s\S]*?(?=\n\n|Experiência|Formação|$)/i);
      if (skillsSection) {
        const skillsText = skillsSection[0].replace(/^(Habilidades|Skills|Competências)[\s:]*/, '');
        const skills = skillsText.split(/[,\n•-]/).map(s => s.trim()).filter(s => s.length > 0);
        profileData.skills = skills.slice(0, 10); // Limitar a 10 habilidades
      }
      
      // Extrair certificações
      const certificationsMatch = resumeText.match(/(?:Certificações|Certificados|Cursos)[\s\S]*?(?=\n\n|Experiência|Habilidades|$)/i);
      if (certificationsMatch) {
        const certsText = certificationsMatch[0].replace(/^(Certificações|Certificados|Cursos)[\s:]*/, '');
        const certifications = certsText.split(/[,\n•-]/).map(s => s.trim()).filter(s => s.length > 0);
        profileData.certifications = certifications.slice(0, 5);
      }
      
      // Extrair projetos
      const projectsMatch = resumeText.match(/(?:Projetos|Portfolio)[\s\S]*?(?=\n\n|Experiência|Habilidades|$)/i);
      if (projectsMatch) {
        const projectsText = projectsMatch[0].replace(/^(Projetos|Portfolio)[\s:]*/, '');
        const projects = projectsText.split(/[,\n•-]/).map(s => s.trim()).filter(s => s.length > 0);
        profileData.projects = projects.slice(0, 5);
      }
      
      resolve(profileData);
    }, 1500);
  });
};

// Função melhorada para parsing de descrição de vaga
export const parseJobDescription = async (input: string): Promise<Partial<JobDescription>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Se for uma URL, tentar extrair dados específicos
      if (input.startsWith('http')) {
        // Verificar se é uma URL do Gupy (Stefanini)
        if (input.includes('stefanini.gupy.io')) {
          resolve({
            title: 'Analista de Sistemas Pleno',
            company: 'Stefanini',
            description: 'Oportunidade para Analista de Sistemas Pleno na Stefanini. Responsável por análise, desenvolvimento e manutenção de sistemas corporativos. Trabalhar com metodologias ágeis e tecnologias modernas.',
            requirements: [
              'Experiência com desenvolvimento de sistemas',
              'Conhecimento em metodologias ágeis',
              'Experiência com bancos de dados',
              'Conhecimento em análise de requisitos'
            ],
            skills: ['Java', 'SQL', 'Spring Boot', 'Angular', 'Git', 'Scrum', 'Oracle'],
            url: input
          });
        }
        // Verificar outras URLs conhecidas
        else if (input.includes('linkedin.com')) {
          resolve({
            title: 'Desenvolvedor Full Stack',
            company: 'LinkedIn Jobs',
            description: 'Vaga para desenvolvedor full stack com experiência em tecnologias modernas.',
            requirements: [
              'Experiência com desenvolvimento web',
              'Conhecimento em front-end e back-end',
              'Experiência com APIs REST'
            ],
            skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB'],
            url: input
          });
        }
        else if (input.includes('vagas.com.br') || input.includes('catho.com.br')) {
          resolve({
            title: 'Desenvolvedor de Software',
            company: 'Portal de Vagas',
            description: 'Oportunidade para desenvolvedor de software em empresa de tecnologia.',
            requirements: [
              'Graduação em área relacionada',
              'Experiência com desenvolvimento',
              'Conhecimento em versionamento'
            ],
            skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Git'],
            url: input
          });
        }
        else {
          // URL genérica - tentar extrair informações básicas
          const domain = new URL(input).hostname;
          const companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
          
          resolve({
            title: 'Oportunidade de Emprego',
            company: companyName,
            description: 'Vaga de emprego encontrada no site da empresa. Para mais detalhes, acesse o link fornecido.',
            requirements: [
              'Experiência na área',
              'Formação adequada',
              'Habilidades técnicas relevantes'
            ],
            skills: ['Comunicação', 'Trabalho em equipe', 'Proatividade'],
            url: input
          });
        }
      } else {
        // Parse do texto da descrição - MELHORADO para identificar títulos específicos
        const skills = extractSkillsFromText(input);
        const requirements = extractRequirementsFromText(input);
        const title = extractTitleFromText(input);
        const company = extractCompanyFromText(input);
        
        resolve({
          title: title || 'Vaga de Emprego',
          company: company || 'Empresa',
          description: input,
          requirements,
          skills
        });
      }
    }, 1500);
  });
};

// Analisar compatibilidade entre currículo e vaga - MELHORADO
export const analyzeResumeCompatibility = async (
  resume: ResumeData, 
  job: JobDescription
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulação de análise de compatibilidade melhorada
      const resumeText = resume.extractedText.toLowerCase();
      const jobSkills = job.skills.map(skill => skill.toLowerCase());
      const jobRequirements = job.requirements.map(req => req.toLowerCase());
      
      // Calcular score baseado em skills encontradas
      const foundSkills = jobSkills.filter(skill => 
        resumeText.includes(skill)
      );
      
      // Calcular score baseado em requisitos atendidos
      const metRequirements = jobRequirements.filter(req => {
        // Verificar palavras-chave dos requisitos no currículo
        const keywords = req.split(' ').filter(word => word.length > 3);
        return keywords.some(keyword => resumeText.includes(keyword));
      });
      
      const skillsScore = jobSkills.length > 0 ? (foundSkills.length / jobSkills.length) * 60 : 30;
      const requirementsScore = jobRequirements.length > 0 ? (metRequirements.length / jobRequirements.length) * 40 : 20;
      
      const compatibilityScore = Math.min(
        Math.round(skillsScore + requirementsScore),
        95
      );
      
      // Pontos fortes específicos baseados na vaga
      const strengths = [];
      
      // Verificar habilidades específicas encontradas
      foundSkills.forEach(skill => {
        const originalSkill = job.skills.find(s => s.toLowerCase() === skill);
        if (originalSkill) {
          strengths.push(`Experiência comprovada em ${originalSkill}`);
        }
      });
      
      // Verificar requisitos específicos
      if (resumeText.includes('cnh') && job.description.toLowerCase().includes('cnh')) {
        strengths.push('Possui CNH conforme exigido pela vaga');
      }
      
      if (resumeText.includes('graduação') || resumeText.includes('superior')) {
        strengths.push('Formação acadêmica adequada');
      }
      
      if (resumeText.includes('experiência') || resumeText.includes('anos')) {
        strengths.push('Experiência profissional relevante');
      }
      
      // Adicionar pontos fortes padrão se necessário
      if (strengths.length === 0) {
        strengths.push(
          'Perfil profissional alinhado com a vaga',
          'Histórico de experiência na área',
          'Competências técnicas relevantes'
        );
      }
      
      // Pontos de melhoria específicos
      const weaknesses = [];
      
      // Habilidades não encontradas
      const missingSkills = jobSkills.filter(skill => !foundSkills.includes(skill));
      missingSkills.slice(0, 3).forEach(skill => {
        const originalSkill = job.skills.find(s => s.toLowerCase() === skill);
        if (originalSkill) {
          weaknesses.push(`Experiência em ${originalSkill} não evidenciada no currículo`);
        }
      });
      
      // Requisitos não atendidos
      const unmetRequirements = jobRequirements.filter(req => !metRequirements.includes(req));
      unmetRequirements.slice(0, 2).forEach(req => {
        weaknesses.push(`Requisito não evidenciado: ${req}`);
      });
      
      // Adicionar pontos de melhoria padrão se necessário
      if (weaknesses.length === 0) {
        weaknesses.push(
          'Algumas habilidades técnicas específicas podem ser destacadas',
          'Experiência com ferramentas mencionadas na vaga'
        );
      }
      
      const improvements = [
        `Destacar experiência com ${job.skills.slice(0, 3).join(', ')}`,
        'Incluir projetos que demonstrem as habilidades requeridas',
        'Adicionar palavras-chave específicas da descrição da vaga',
        'Quantificar resultados e conquistas profissionais',
        `Enfatizar experiência relevante para ${job.title}`
      ];
      
      resolve({
        id: generateId(),
        resumeId: resume.id,
        jobId: job.id,
        compatibilityScore,
        strengths,
        weaknesses,
        improvements,
        createdAt: new Date()
      });
    }, 2000);
  });
};

// Gerar currículo otimizado com dados do usuário
export const generateOptimizedResume = async (
  resume: ResumeData,
  job: JobDescription,
  analysis: AnalysisResult,
  userProfile?: UserProfile
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const optimizedContent = `
CURRÍCULO OTIMIZADO PARA: ${job.title}

=== INFORMAÇÕES PESSOAIS ===
Nome: ${userProfile?.fullName || '[Seu Nome]'}
Email: ${userProfile?.email || '[seu.email@exemplo.com]'}
Telefone: ${userProfile?.phone || '[seu telefone]'}
Endereço: ${userProfile?.address || '[seu endereço]'}
LinkedIn: [seu perfil]

=== RESUMO PROFISSIONAL ===
Profissional com experiência em desenvolvimento de software, especializado em ${job.skills.slice(0, 3).join(', ')}. 
Busco oportunidade como ${job.title} para aplicar meus conhecimentos e contribuir para o crescimento da ${job.company}.

=== HABILIDADES TÉCNICAS ===
${job.skills.map(skill => `• ${skill}`).join('\n')}
${userProfile?.skills ? userProfile.skills.map(skill => `• ${skill}`).join('\n') : ''}

=== EXPERIÊNCIA PROFISSIONAL ===
${userProfile?.experience || `[Cargo Anterior] - [Empresa] (Período)
• Desenvolveu soluções utilizando ${job.skills[0]} e ${job.skills[1]}
• Participou de projetos que resultaram em melhorias significativas
• Trabalhou em equipe seguindo metodologias ágeis`}

=== FORMAÇÃO ACADÊMICA ===
${userProfile?.education || '[Curso] - [Instituição] (Ano)'}

=== PROJETOS RELEVANTES ===
${userProfile?.projects ? userProfile.projects.map(project => `• ${project}`).join('\n') : 
`• Projeto utilizando ${job.skills[0]}: Descrição do projeto
• Sistema desenvolvido com ${job.skills[1]}: Descrição do projeto`}

=== CERTIFICAÇÕES ===
${userProfile?.certifications ? userProfile.certifications.map(cert => `• ${cert}`).join('\n') : 
`• Certificação em ${job.skills[0]}
• Curso de ${job.skills[1]}`}

---
Este currículo foi otimizado com base na análise de compatibilidade de ${analysis.compatibilityScore}%
      `.trim();
      
      resolve(optimizedContent);
    }, 1500);
  });
};

// Funções auxiliares melhoradas
const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'SQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS', 'Angular', 'Vue.js',
    'Spring Boot', 'MongoDB', 'PostgreSQL', 'Oracle', 'Scrum', 'Agile',
    'REST API', 'GraphQL', 'Kubernetes', 'Jenkins', 'Linux', 'Windows'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

const extractRequirementsFromText = (text: string): string[] => {
  const requirements = [];
  
  if (text.toLowerCase().includes('experiência')) {
    requirements.push('Experiência comprovada na área');
  }
  if (text.toLowerCase().includes('graduação') || text.toLowerCase().includes('superior')) {
    requirements.push('Formação superior completa');
  }
  if (text.toLowerCase().includes('inglês')) {
    requirements.push('Conhecimento em inglês');
  }
  if (text.toLowerCase().includes('equipe')) {
    requirements.push('Capacidade de trabalhar em equipe');
  }
  if (text.toLowerCase().includes('cnh')) {
    requirements.push('Carteira Nacional de Habilitação');
  }
  
  // Adicionar requisitos padrão se nenhum foi encontrado
  if (requirements.length === 0) {
    requirements.push(
      'Experiência comprovada na área',
      'Conhecimento das tecnologias mencionadas',
      'Capacidade de trabalhar em equipe',
      'Proatividade e autonomia'
    );
  }
  
  return requirements;
};

const extractTitleFromText = (text: string): string | null => {
  // Procurar por padrões específicos primeiro
  const specificPatterns = [
    /(\d+\s*-\s*)?([A-Z\s]+(?:ADMINISTRATIVO|DESENVOLVEDOR|ANALISTA|ENGENHEIRO|TÉCNICO|AUXILIAR|ASSISTENTE|COORDENADOR|GERENTE|SUPERVISOR)[A-Z\s]*(?:DE\s+[A-Z]+)?)/i,
    /vaga\s+para\s+([^.\n]+)/i,
    /cargo:\s*([^.\n]+)/i,
    /posição:\s*([^.\n]+)/i,
    /oportunidade\s+para\s+([^.\n]+)/i
  ];
  
  for (const pattern of specificPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Se encontrou um padrão com código (como "10006272 - AUXILIAR ADMINISTRATIVO DE TI")
      if (match[2]) {
        return match[2].trim();
      }
      return (match[1] || match[0]).trim();
    }
  }
  
  return null;
};

const extractCompanyFromText = (text: string): string | null => {
  // Procurar por padrões comuns de nomes de empresa
  const companyPatterns = [
    /empresa:\s*([^.\n]+)/i,
    /companhia:\s*([^.\n]+)/i,
    /na\s+([A-Z][a-zA-Z\s]+)\s+está/i,
    /grupo\s+([A-Z][a-zA-Z\s]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
};