import { JobDescription, ResumeData, AnalysisResult } from './types';
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

// Simular parsing de descrição de vaga
export const parseJobDescription = async (input: string): Promise<Partial<JobDescription>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Se for uma URL, simular extração de dados
      if (input.startsWith('http')) {
        resolve({
          title: 'Desenvolvedor Full Stack',
          company: 'Empresa Tech',
          description: 'Vaga para desenvolvedor full stack com experiência em React, Node.js e bancos de dados. Conhecimento em TypeScript é um diferencial.',
          requirements: [
            'Experiência com React',
            'Conhecimento em Node.js',
            'Experiência com bancos de dados',
            'Conhecimento em Git'
          ],
          skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'Git'],
          url: input
        });
      } else {
        // Parse do texto da descrição
        const skills = extractSkillsFromText(input);
        const requirements = extractRequirementsFromText(input);
        
        resolve({
          title: 'Vaga de Emprego',
          company: 'Empresa',
          description: input,
          requirements,
          skills
        });
      }
    }, 1500);
  });
};

// Analisar compatibilidade entre currículo e vaga
export const analyzeResumeCompatibility = async (
  resume: ResumeData, 
  job: JobDescription
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulação de análise de compatibilidade
      const resumeText = resume.extractedText.toLowerCase();
      const jobSkills = job.skills.map(skill => skill.toLowerCase());
      
      // Calcular score baseado em skills encontradas
      const foundSkills = jobSkills.filter(skill => 
        resumeText.includes(skill)
      );
      
      const compatibilityScore = Math.min(
        Math.round((foundSkills.length / jobSkills.length) * 100),
        95
      );
      
      const strengths = [
        'Experiência relevante na área',
        'Formação adequada para a posição',
        'Histórico profissional consistente'
      ];
      
      const weaknesses = [
        'Algumas habilidades técnicas podem ser aprimoradas',
        'Experiência com ferramentas específicas da vaga',
        'Certificações relevantes para a área'
      ];
      
      const improvements = [
        'Destacar mais as experiências com as tecnologias mencionadas na vaga',
        'Incluir projetos que demonstrem as habilidades requeridas',
        'Adicionar palavras-chave específicas da descrição da vaga',
        'Quantificar resultados e conquistas profissionais'
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

// Gerar currículo otimizado
export const generateOptimizedResume = async (
  resume: ResumeData,
  job: JobDescription,
  analysis: AnalysisResult
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const optimizedContent = `
CURRÍCULO OTIMIZADO PARA: ${job.title}

=== INFORMAÇÕES PESSOAIS ===
Nome: [Seu Nome]
Email: [seu.email@exemplo.com]
Telefone: [seu telefone]
LinkedIn: [seu perfil]

=== RESUMO PROFISSIONAL ===
Profissional com experiência em desenvolvimento de software, especializado em ${job.skills.slice(0, 3).join(', ')}. 
Busco oportunidade como ${job.title} para aplicar meus conhecimentos e contribuir para o crescimento da ${job.company}.

=== HABILIDADES TÉCNICAS ===
${job.skills.map(skill => `• ${skill}`).join('\n')}

=== EXPERIÊNCIA PROFISSIONAL ===
[Cargo Anterior] - [Empresa] (Período)
• Desenvolveu soluções utilizando ${job.skills[0]} e ${job.skills[1]}
• Participou de projetos que resultaram em melhorias significativas
• Trabalhou em equipe seguindo metodologias ágeis

=== FORMAÇÃO ACADÊMICA ===
[Curso] - [Instituição] (Ano)

=== PROJETOS RELEVANTES ===
• Projeto utilizando ${job.skills[0]}: Descrição do projeto
• Sistema desenvolvido com ${job.skills[1]}: Descrição do projeto

=== CERTIFICAÇÕES ===
• Certificação em ${job.skills[0]}
• Curso de ${job.skills[1]}

---
Este currículo foi otimizado com base na análise de compatibilidade de ${analysis.compatibilityScore}%
      `.trim();
      
      resolve(optimizedContent);
    }, 1500);
  });
};

// Funções auxiliares
const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'SQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS', 'Angular', 'Vue.js'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

const extractRequirementsFromText = (text: string): string[] => {
  // Simulação de extração de requisitos
  return [
    'Experiência comprovada na área',
    'Conhecimento das tecnologias mencionadas',
    'Capacidade de trabalhar em equipe',
    'Proatividade e autonomia'
  ];
};