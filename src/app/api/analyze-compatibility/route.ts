import { NextRequest, NextResponse } from 'next/server';

// Função de fallback para análise local
function analyzeCompatibilityLocally(resumeText: string, jobDescription: string, jobRequirements?: string[], jobSkills?: string[]) {
  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();
  const requirements = jobRequirements?.map(req => req.toLowerCase()) || [];
  const skills = jobSkills?.map(skill => skill.toLowerCase()) || [];
  
  // Análise básica de compatibilidade
  let score = 50; // Score base
  
  // Verificar palavras-chave comuns
  const commonKeywords = ['experiência', 'conhecimento', 'habilidade', 'projeto', 'desenvolvimento'];
  const keywordMatches = commonKeywords.filter(keyword => 
    resume.includes(keyword) && job.includes(keyword)
  ).length;
  score += keywordMatches * 5;
  
  // Verificar requisitos específicos
  const reqMatches = requirements.filter(req => resume.includes(req)).length;
  if (requirements.length > 0) {
    score += (reqMatches / requirements.length) * 30;
  }
  
  // Verificar habilidades específicas
  const skillMatches = skills.filter(skill => resume.includes(skill)).length;
  if (skills.length > 0) {
    score += (skillMatches / skills.length) * 20;
  }
  
  // Limitar score entre 0 e 100
  score = Math.min(Math.max(Math.round(score), 0), 100);
  
  return {
    compatibilityScore: score,
    strengths: [
      'Experiência relevante identificada no currículo',
      'Conhecimento das principais áreas mencionadas na vaga',
      'Perfil alinhado com as expectativas do mercado'
    ],
    weaknesses: [
      'Algumas habilidades específicas podem ser desenvolvidas',
      'Experiência em certas áreas pode ser aprofundada'
    ],
    improvements: [
      'Destacar mais resultados quantificáveis nas experiências',
      'Incluir palavras-chave específicas da vaga',
      'Reorganizar o currículo para destacar pontos mais relevantes',
      'Adicionar projetos ou certificações relacionadas à área'
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validação do request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }

    const { resumeText, jobDescription, jobRequirements, jobSkills } = body;
    
    // Validação dos campos obrigatórios
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto do currículo é obrigatório e deve ser uma string válida' },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Descrição da vaga é obrigatória e deve ser uma string válida' },
        { status: 400 }
      );
    }

    // Tentar usar a API do OpenAI primeiro
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.log('OPENAI_API_KEY não configurada, usando análise local');
        throw new Error('API key não configurada');
      }

      // Fazer chamada para API de IA (OpenAI) com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

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
              content: `Você é um especialista em análise de currículos e compatibilidade com vagas de emprego. 

Analise o currículo fornecido em relação à vaga e retorne um JSON com o seguinte formato:
{
  "compatibilityScore": number (0-100),
  "strengths": ["array de strings - pontos fortes do candidato"],
  "weaknesses": ["array de strings - pontos que precisam melhorar"],
  "improvements": ["array de strings - sugestões específicas de melhoria"]
}

Critérios de análise:
1. Experiência relevante (30%)
2. Habilidades técnicas (25%)
3. Formação acadêmica (20%)
4. Projetos e certificações (15%)
5. Adequação cultural e soft skills (10%)

Seja específico e construtivo nas análises. Foque em aspectos práticos e acionáveis.`
            },
            {
              role: 'user',
              content: `CURRÍCULO:
${resumeText}

VAGA:
${jobDescription}

REQUISITOS:
${jobRequirements?.join('\n') || 'Não especificados'}

HABILIDADES NECESSÁRIAS:
${jobSkills?.join(', ') || 'Não especificadas'}

Analise a compatibilidade entre este currículo e esta vaga.`
            }
          ],
          temperature: 0.2,
          max_tokens: 1500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Tentar parsear o JSON
      let parsedResult;
      try {
        parsedResult = JSON.parse(content);
      } catch (parseError) {
        // Se falhar o parse, tentar extrair JSON do texto
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            throw new Error('Não foi possível extrair JSON válido da resposta');
          }
        } else {
          throw new Error('Não foi possível extrair JSON válido da resposta');
        }
      }

      // Validar e garantir estrutura mínima
      const result = {
        compatibilityScore: Math.min(Math.max(parsedResult.compatibilityScore || 75, 0), 100),
        strengths: Array.isArray(parsedResult.strengths) ? parsedResult.strengths : [
          'Experiência relevante na área',
          'Conhecimento das tecnologias principais'
        ],
        weaknesses: Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses : [
          'Algumas habilidades específicas podem ser desenvolvidas'
        ],
        improvements: Array.isArray(parsedResult.improvements) ? parsedResult.improvements : [
          'Destacar mais resultados quantificáveis',
          'Incluir palavras-chave da vaga'
        ]
      };

      return NextResponse.json(result);

    } catch (apiError) {
      console.log('Erro na API OpenAI, usando análise local:', apiError);
      
      // Fallback para análise local
      const localResult = analyzeCompatibilityLocally(resumeText, jobDescription, jobRequirements, jobSkills);
      return NextResponse.json(localResult);
    }

  } catch (error) {
    console.error('Erro geral na API de análise de compatibilidade:', error);
    
    // Fallback final - retornar análise básica
    try {
      const body = await request.json();
      const { resumeText, jobDescription, jobRequirements, jobSkills } = body;
      
      if (resumeText && jobDescription) {
        const fallbackResult = analyzeCompatibilityLocally(resumeText, jobDescription, jobRequirements, jobSkills);
        return NextResponse.json(fallbackResult);
      }
    } catch (fallbackError) {
      console.error('Erro no fallback final:', fallbackError);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno na análise de compatibilidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}