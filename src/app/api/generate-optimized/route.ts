import { NextRequest, NextResponse } from 'next/server';

interface UserProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  certifications?: string[];
  projects?: string[];
}

// Função de fallback para geração local
function generateOptimizedResumeLocally(
  resumeText: string, 
  jobTitle: string, 
  jobCompany?: string, 
  jobRequirements?: string[], 
  jobSkills?: string[],
  analysisStrengths?: string[],
  analysisImprovements?: string[],
  userProfile?: UserProfile
) {
  // Tentar identificar seções do currículo
  const name = userProfile?.fullName || 'Candidato';
  const email = userProfile?.email || '';
  const phone = userProfile?.phone || '';
  const address = userProfile?.address || '';
  
  // Criar objetivo otimizado para a vaga
  const objective = `Profissional experiente buscando oportunidade como ${jobTitle}${jobCompany ? ` na ${jobCompany}` : ''}, com foco em aplicar conhecimentos e habilidades para contribuir com os objetivos da empresa e crescer profissionalmente na área.`;
  
  // Organizar habilidades relevantes
  const relevantSkills = jobSkills?.length ? jobSkills : [
    'Comunicação eficaz',
    'Trabalho em equipe',
    'Resolução de problemas',
    'Adaptabilidade',
    'Organização'
  ];
  
  // Criar currículo otimizado
  let optimizedResume = `${name}\n`;
  if (email) optimizedResume += `Email: ${email}\n`;
  if (phone) optimizedResume += `Telefone: ${phone}\n`;
  if (address) optimizedResume += `Endereço: ${address}\n`;
  
  optimizedResume += `\nOBJETIVO PROFISSIONAL\n${objective}\n`;
  
  // Adicionar pontos fortes identificados
  if (analysisStrengths?.length) {
    optimizedResume += `\nPONTOS FORTES\n`;
    analysisStrengths.forEach(strength => {
      optimizedResume += `• ${strength}\n`;
    });
  }
  
  // Seção de experiência (reorganizada)
  optimizedResume += `\nEXPERIÊNCIA PROFISSIONAL\n`;
  
  // Tentar extrair experiências do currículo original
  const experienceSection = resumeText.toLowerCase().includes('experiência') ? 
    resumeText.split(/experiência|experience/i)[1]?.split(/formação|education|habilidades|skills/i)[0] : '';
  
  if (experienceSection && experienceSection.trim()) {
    optimizedResume += experienceSection.trim() + '\n';
  } else {
    optimizedResume += `Experiência relevante na área de ${jobTitle.toLowerCase()}, com conhecimento das principais práticas e ferramentas do mercado.\n`;
  }
  
  // Seção de formação
  optimizedResume += `\nFORMAÇÃO ACADÊMICA\n`;
  const educationSection = resumeText.toLowerCase().includes('formação') || resumeText.toLowerCase().includes('education') ? 
    resumeText.split(/formação|education/i)[1]?.split(/experiência|experience|habilidades|skills/i)[0] : '';
  
  if (educationSection && educationSection.trim()) {
    optimizedResume += educationSection.trim() + '\n';
  } else if (userProfile?.education) {
    optimizedResume += `${userProfile.education}\n`;
  } else {
    optimizedResume += `Formação adequada para a área de atuação.\n`;
  }
  
  // Seção de habilidades
  optimizedResume += `\nHABILIDADES TÉCNICAS E COMPORTAMENTAIS\n`;
  relevantSkills.forEach(skill => {
    optimizedResume += `• ${skill}\n`;
  });
  
  // Adicionar melhorias sugeridas como projetos/certificações
  if (analysisImprovements?.length) {
    optimizedResume += `\nÁREAS DE DESENVOLVIMENTO\n`;
    analysisImprovements.forEach(improvement => {
      optimizedResume += `• ${improvement}\n`;
    });
  }
  
  return optimizedResume;
}

export async function POST(request: NextRequest) {
  try {
    // Validação do request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }

    const { 
      resumeText, 
      jobTitle, 
      jobCompany, 
      jobRequirements, 
      jobSkills, 
      analysisStrengths, 
      analysisImprovements,
      userProfile 
    } = body;
    
    // Validação dos campos obrigatórios
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto do currículo é obrigatório' },
        { status: 400 }
      );
    }

    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
      return NextResponse.json(
        { error: 'Título da vaga é obrigatório' },
        { status: 400 }
      );
    }

    // Tentar usar a API do OpenAI primeiro
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.log('OPENAI_API_KEY não configurada, usando geração local');
        throw new Error('API key não configurada');
      }

      // Fazer chamada para API de IA (OpenAI) com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em otimização de currículos. Sua tarefa é reescrever um currículo para maximizar a compatibilidade com uma vaga específica.

Diretrizes para otimização:
1. Mantenha todas as informações verdadeiras - NUNCA invente experiências
2. Reorganize e reformule o conteúdo para destacar aspectos relevantes à vaga
3. Use palavras-chave da descrição da vaga de forma natural
4. Destaque conquistas quantificáveis quando possível
5. Ajuste o objetivo profissional para a vaga específica
6. Priorize experiências e habilidades mais relevantes
7. Use formato profissional e bem estruturado
8. Inclua seções: Dados Pessoais, Objetivo, Experiência, Formação, Habilidades, Certificações, Projetos

Retorne apenas o currículo otimizado em texto formatado, sem JSON ou explicações adicionais.`
            },
            {
              role: 'user',
              content: `CURRÍCULO ORIGINAL:
${resumeText}

VAGA ALVO:
Cargo: ${jobTitle}
Empresa: ${jobCompany || 'Não especificada'}

REQUISITOS DA VAGA:
${jobRequirements?.join('\n') || 'Não especificados'}

HABILIDADES NECESSÁRIAS:
${jobSkills?.join(', ') || 'Não especificadas'}

PONTOS FORTES IDENTIFICADOS:
${analysisStrengths?.join('\n') || 'Não especificados'}

MELHORIAS SUGERIDAS:
${analysisImprovements?.join('\n') || 'Não especificadas'}

PERFIL DO USUÁRIO:
${userProfile ? `
Nome: ${userProfile.fullName || 'Não informado'}
Email: ${userProfile.email || 'Não informado'}
Telefone: ${userProfile.phone || 'Não informado'}
Endereço: ${userProfile.address || 'Não informado'}
Formação: ${userProfile.education || 'Não informada'}
Experiência: ${userProfile.experience || 'Não informada'}
Habilidades: ${userProfile.skills?.join(', ') || 'Não informadas'}
Certificações: ${userProfile.certifications?.join(', ') || 'Não informadas'}
Projetos: ${userProfile.projects?.join(', ') || 'Não informados'}
` : 'Perfil não disponível'}

Otimize este currículo para a vaga especificada, mantendo todas as informações verdadeiras mas reorganizando e reformulando para maximizar a compatibilidade.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const optimizedResume = aiResponse.choices[0]?.message?.content;

      if (!optimizedResume) {
        throw new Error('Resposta vazia da IA');
      }

      return NextResponse.json({ optimizedResume });

    } catch (apiError) {
      console.log('Erro na API OpenAI, usando geração local:', apiError);
      
      // Fallback para geração local
      const localOptimizedResume = generateOptimizedResumeLocally(
        resumeText, 
        jobTitle, 
        jobCompany, 
        jobRequirements, 
        jobSkills,
        analysisStrengths,
        analysisImprovements,
        userProfile
      );
      
      return NextResponse.json({ optimizedResume: localOptimizedResume });
    }

  } catch (error) {
    console.error('Erro geral na API de geração de currículo otimizado:', error);
    
    // Fallback final
    try {
      const body = await request.json();
      const { resumeText, jobTitle, jobCompany, jobRequirements, jobSkills, analysisStrengths, analysisImprovements, userProfile } = body;
      
      if (resumeText && jobTitle) {
        const fallbackResume = generateOptimizedResumeLocally(
          resumeText, 
          jobTitle, 
          jobCompany, 
          jobRequirements, 
          jobSkills,
          analysisStrengths,
          analysisImprovements,
          userProfile
        );
        
        return NextResponse.json({ optimizedResume: fallbackResume });
      }
    } catch (fallbackError) {
      console.error('Erro no fallback final:', fallbackError);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno na geração do currículo otimizado',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}