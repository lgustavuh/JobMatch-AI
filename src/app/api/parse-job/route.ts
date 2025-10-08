import { NextRequest, NextResponse } from 'next/server';
import { detectSeniority, detectWorkModel, calculateExtractionConfidence, cleanHtmlContent } from '@/lib/job-extractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobText, url, idioma = 'pt-BR', campos_extras } = body;
    
    // Se foi fornecida uma URL, fazer scraping
    if (url) {
      return await handleUrlExtraction(url, idioma, campos_extras);
    }
    
    // Se foi fornecido texto, processar diretamente
    if (jobText) {
      return await handleTextExtraction(jobText);
    }
    
    return NextResponse.json(
      { error: 'Texto da vaga ou URL é obrigatório' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro na API de parsing da vaga:', error);
    return NextResponse.json(
      { 
        erro: true,
        mensagem: 'Erro interno no parsing da vaga',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

async function handleUrlExtraction(url: string, idioma: string, campos_extras?: string[]) {
  try {
    // Fazer fetch da URL no servidor (sem problemas de CORS)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Erro ao acessar URL ${url}: Status ${response.status}`);
      return NextResponse.json({
        erro: true,
        mensagem: `Não foi possível acessar a URL. Status: ${response.status}`,
        url
      });
    }

    const html = await response.text();
    const cleanedText = cleanHtmlContent(html);

    if (!cleanedText || cleanedText.length < 100) {
      console.error(`Conteúdo insuficiente da URL ${url}: ${cleanedText?.length || 0} caracteres`);
      return NextResponse.json({
        erro: true,
        mensagem: "Conteúdo insuficiente para extração.",
        url
      });
    }

    // Processar o conteúdo extraído com IA
    const extractedData = await extractJobDataWithAI(cleanedText, url);
    
    if (extractedData.erro) {
      return NextResponse.json(extractedData);
    }

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Erro ao processar URL:', url, error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({
          erro: true,
          mensagem: "Timeout ao acessar a URL. Tente novamente ou cole o texto da vaga.",
          url
        });
      }
      
      if (error.message.includes('fetch')) {
        return NextResponse.json({
          erro: true,
          mensagem: "Não foi possível acessar a URL. Verifique se o link está correto.",
          url
        });
      }
    }
    
    return NextResponse.json({
      erro: true,
      mensagem: "Erro ao acessar a URL fornecida.",
      url
    });
  }
}

async function handleTextExtraction(jobText: string) {
  try {
    // Verificar se tem API key do OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key não configurada, usando fallback parsing');
      return NextResponse.json(createFallbackTextExtraction(jobText));
    }

    // Fazer chamada para API de IA (OpenAI)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de vagas de emprego. Analise o texto fornecido e extraia as informações principais da vaga.

Retorne um JSON com o seguinte formato:
{
  "title": "string - título da vaga",
  "company": "string - nome da empresa",
  "description": "string - descrição resumida da vaga",
  "requirements": ["array de strings - requisitos da vaga"],
  "skills": ["array de strings - habilidades técnicas necessárias"]
}

Foque em extrair informações claras e objetivas. Para skills, inclua apenas tecnologias, linguagens de programação, ferramentas e competências técnicas específicas.`
          },
          {
            role: 'user',
            content: `Analise esta vaga de emprego e extraia as informações principais:

${jobText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`);
      throw new Error(`OpenAI API error: ${response.status}`);
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
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }
    }

    // Validar e garantir estrutura mínima
    const result = {
      title: parsedResult.title || 'Vaga de Emprego',
      company: parsedResult.company || 'Empresa',
      description: parsedResult.description || jobText.substring(0, 500),
      requirements: Array.isArray(parsedResult.requirements) ? parsedResult.requirements : [],
      skills: Array.isArray(parsedResult.skills) ? parsedResult.skills : []
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro na extração de texto:', error);
    
    // Fallback: parsing básico sem IA
    const fallbackResult = createFallbackTextExtraction(jobText);
    return NextResponse.json(fallbackResult);
  }
}

// Função para criar extração fallback de texto
function createFallbackTextExtraction(jobText: string) {
  return {
    title: extractTitle(jobText),
    company: extractCompany(jobText),
    description: jobText.substring(0, 500),
    requirements: extractRequirements(jobText),
    skills: extractSkills(jobText)
  };
}

async function extractJobDataWithAI(content: string, url: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback sem IA
      return createFallbackExtraction(content, url);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extração de dados de vagas de emprego. Analise o conteúdo fornecido e extraia as informações seguindo EXATAMENTE este formato JSON:

{
  "fonte": {
    "url": "${url}",
    "dominio": "${new URL(url).hostname}",
    "capturado_em": "${new Date().toISOString()}"
  },
  "vaga": {
    "titulo": "string",
    "senioridade": "junior|pleno|senior|especialista|null",
    "area": "string|null",
    "empresa": {
      "nome": "string",
      "descricao_curta": "string|null",
      "local_trabalho": "string|null",
      "modelo_trabalho": "presencial|hibrido|remoto|null",
      "tempo_de_mercado": "string|null",
      "selo_cultural_reconhecimentos": ["string"]
    },
    "localizacao": "string|null",
    "tipo_contrato": "string|null",
    "carga_horaria": "string|null",
    "salario_faixa": "string|null",
    "beneficios": ["string"],
    "responsabilidades": ["string"],
    "requisitos": {
      "formacao": ["string"],
      "experiencia": "string|null",
      "competencias_comportamentais": ["string"],
      "competencias_tecnicas": ["string"],
      "diferenciais": ["string"]
    },
    "processo_seletivo_etapas": ["string"],
    "data_publicacao": "YYYY-MM-DD|null",
    "data_encerramento": "YYYY-MM-DD|null"
  },
  "resumo_curto": "string (máx. 500 caracteres)",
  "metadados": {
    "lingua_detectada": "pt-BR",
    "confianca_extracao": 0.85,
    "campos_ausentes": ["string"]
  }
}

Se não encontrar uma informação, use null ou array vazio. Seja preciso e objetivo.`
          },
          {
            role: 'user',
            content: `Extraia os dados desta vaga de emprego:

${content.substring(0, 4000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Resposta vazia da IA');
    }

    // Tentar parsear o JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiContent);
    } catch (parseError) {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON inválido da IA');
      }
    }

    // Validar estrutura mínima
    if (!parsedResult.vaga || !parsedResult.fonte) {
      throw new Error('Estrutura de dados inválida');
    }

    return parsedResult;

  } catch (error) {
    console.error('Erro na extração com IA:', error);
    return createFallbackExtraction(content, url);
  }
}

function createFallbackExtraction(content: string, url: string) {
  const titulo = extractTitle(content);
  const empresa = extractCompany(content);
  const skills = extractSkills(content);
  const requirements = extractRequirements(content);
  
  return {
    fonte: {
      url,
      dominio: new URL(url).hostname,
      capturado_em: new Date().toISOString()
    },
    vaga: {
      titulo,
      senioridade: detectSeniority(content),
      area: null,
      empresa: {
        nome: empresa,
        descricao_curta: null,
        local_trabalho: null,
        modelo_trabalho: detectWorkModel(content),
        tempo_de_mercado: null,
        selo_cultural_reconhecimentos: []
      },
      localizacao: null,
      tipo_contrato: null,
      carga_horaria: null,
      salario_faixa: null,
      beneficios: [],
      responsabilidades: [],
      requisitos: {
        formacao: [],
        experiencia: null,
        competencias_comportamentais: [],
        competencias_tecnicas: skills,
        diferenciais: []
      },
      processo_seletivo_etapas: [],
      data_publicacao: null,
      data_encerramento: null
    },
    resumo_curto: `${empresa} • ${titulo} • ${skills.slice(0, 3).join(', ')}`,
    metadados: {
      lingua_detectada: 'pt-BR',
      confianca_extracao: 0.6,
      campos_ausentes: ['area', 'localizacao', 'beneficios', 'responsabilidades']
    }
  };
}

// Funções auxiliares para parsing básico
function extractTitle(text: string): string {
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (firstLine && firstLine.length < 100) {
    return firstLine;
  }
  
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
    
    if (/requisitos|requirements|qualificações|experiência|formação/i.test(trimmedLine)) {
      inRequirementsSection = true;
      continue;
    }
    
    if (inRequirementsSection && /benefícios|salário|contato|sobre|empresa/i.test(trimmedLine)) {
      inRequirementsSection = false;
    }
    
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