import { NextRequest, NextResponse } from 'next/server';

interface JobData {
  vaga?: {
    titulo?: string;
    senioridade?: string | null;
    area?: string | null;
    empresa?: {
      nome?: string;
      descricao_curta?: string | null;
      local_trabalho?: string | null;
      modelo_trabalho?: string | null;
      tempo_de_mercado?: string | null;
      selo_cultural_reconhecimentos?: string[];
    };
    localizacao?: string | null;
    tipo_contrato?: string | null;
    carga_horaria?: string | null;
    salario_faixa?: string | null;
    beneficios?: string[];
    responsabilidades?: string[];
    requisitos?: {
      formacao?: string[];
      experiencia?: string | null;
      competencias_comportamentais?: string[];
      competencias_tecnicas?: string[];
      diferenciais?: string[];
    };
    processo_seletivo_etapas?: string[];
    data_publicacao?: string | null;
    data_encerramento?: string | null;
  };
  resumo_curto?: string;
  metadados?: {
    lingua_detectada?: string;
    confianca_extracao?: number;
    campos_ausentes?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, url, content } = await request.json();
    
    if (!prompt || !url || !content) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes' },
        { status: 400 }
      );
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
            content: `Você é um especialista em extração de dados de vagas de emprego. Analise o conteúdo fornecido e extraia as informações no formato JSON especificado.

FORMATO DE SAÍDA OBRIGATÓRIO:
{
  "fonte": {
    "url": "string",
    "dominio": "string",
    "capturado_em": "YYYY-MM-DDTHH:mm:ssZ"
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
  "resumo_curto": "string (máx. 500 caracteres, bullets separados por ' • ')",
  "metadados": {
    "lingua_detectada": "string",
    "confianca_extracao": 0.0,
    "campos_ausentes": ["string"]
  }
}

REGRAS:
1. Extraia APENAS informações claramente presentes no texto
2. Use null para campos não encontrados
3. Arrays vazios para listas não encontradas
4. Senioridade: detecte palavras-chave (junior, pleno, senior, especialista)
5. Modelo trabalho: detecte (presencial, hibrido, remoto)
6. Datas no formato ISO (YYYY-MM-DD)
7. Resumo curto: máximo 500 caracteres com bullets separados por ' • '
8. Confiança: valor entre 0 e 1 baseado na completude dos dados
9. Campos ausentes: liste campos que não foram encontrados

Retorne APENAS o JSON, sem texto adicional.`
          },
          {
            role: 'user',
            content: prompt
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
    const extractedContent = aiResponse.choices[0]?.message?.content;

    if (!extractedContent) {
      throw new Error('Resposta vazia da IA');
    }

    // Tentar parsear o JSON
    let extractedData: JobData;
    try {
      extractedData = JSON.parse(extractedContent);
    } catch {
      // Se falhar o parse, tentar extrair JSON do texto
      const jsonMatch = extractedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair JSON válido da resposta');
      }
    }

    // Validar e completar dados obrigatórios
    const validatedData = validateAndCompleteData(extractedData, url);

    return NextResponse.json(validatedData);

  } catch (error: unknown) {
    console.error('Erro na API de extração:', error);
    return NextResponse.json(
      { error: 'Erro interno na extração de dados' },
      { status: 500 }
    );
  }
}

function validateAndCompleteData(data: JobData, url: string) {
  const now = new Date().toISOString();
  const domain = new URL(url).hostname;

  // Garantir estrutura mínima
  const validated = {
    fonte: {
      url: url,
      dominio: domain,
      capturado_em: now
    },
    vaga: {
      titulo: data.vaga?.titulo || 'Vaga de Emprego',
      senioridade: data.vaga?.senioridade || null,
      area: data.vaga?.area || null,
      empresa: {
        nome: data.vaga?.empresa?.nome || 'Empresa',
        descricao_curta: data.vaga?.empresa?.descricao_curta || null,
        local_trabalho: data.vaga?.empresa?.local_trabalho || null,
        modelo_trabalho: data.vaga?.empresa?.modelo_trabalho || null,
        tempo_de_mercado: data.vaga?.empresa?.tempo_de_mercado || null,
        selo_cultural_reconhecimentos: data.vaga?.empresa?.selo_cultural_reconhecimentos || []
      },
      localizacao: data.vaga?.localizacao || null,
      tipo_contrato: data.vaga?.tipo_contrato || null,
      carga_horaria: data.vaga?.carga_horaria || null,
      salario_faixa: data.vaga?.salario_faixa || null,
      beneficios: data.vaga?.beneficios || [],
      responsabilidades: data.vaga?.responsabilidades || [],
      requisitos: {
        formacao: data.vaga?.requisitos?.formacao || [],
        experiencia: data.vaga?.requisitos?.experiencia || null,
        competencias_comportamentais: data.vaga?.requisitos?.competencias_comportamentais || [],
        competencias_tecnicas: data.vaga?.requisitos?.competencias_tecnicas || [],
        diferenciais: data.vaga?.requisitos?.diferenciais || []
      },
      processo_seletivo_etapas: data.vaga?.processo_seletivo_etapas || [],
      data_publicacao: data.vaga?.data_publicacao || null,
      data_encerramento: data.vaga?.data_encerramento || null
    },
    resumo_curto: data.resumo_curto || generateDefaultSummary(data.vaga),
    metadados: {
      lingua_detectada: data.metadados?.lingua_detectada || 'pt-BR',
      confianca_extracao: data.metadados?.confianca_extracao || calculateConfidence(data.vaga),
      campos_ausentes: data.metadados?.campos_ausentes || findMissingFields(data.vaga)
    }
  };

  return validated;
}

function generateDefaultSummary(vaga: JobData['vaga']): string {
  const parts = [];
  
  if (vaga?.empresa?.nome) parts.push(vaga.empresa.nome);
  if (vaga?.titulo) parts.push(vaga.titulo);
  if (vaga?.empresa?.modelo_trabalho && vaga?.localizacao) {
    parts.push(`${vaga.empresa.modelo_trabalho} ${vaga.localizacao}`);
  } else if (vaga?.localizacao) {
    parts.push(vaga.localizacao);
  }
  
  const summary = parts.join(' • ');
  return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
}

function calculateConfidence(vaga: JobData['vaga']): number {
  let score = 0;
  const total = 10;

  // Campos obrigatórios (peso 2)
  const required = ['titulo', 'empresa.nome'];
  required.forEach(field => {
    if (getNestedValue(vaga, field)) score += 2;
  });

  // Campos importantes (peso 1)
  const important = ['senioridade', 'area', 'responsabilidades', 'requisitos.experiencia'];
  important.forEach(field => {
    const value = getNestedValue(vaga, field);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) score += 1;
  });

  // Campos opcionais (peso 0.5)
  const optional = ['beneficios', 'requisitos.competencias_tecnicas'];
  optional.forEach(field => {
    const value = getNestedValue(vaga, field);
    if (value && Array.isArray(value) && value.length > 0) score += 0.5;
  });

  return Math.min(Math.round((score / total) * 100) / 100, 1);
}

function findMissingFields(vaga: JobData['vaga']): string[] {
  const missing = [];
  
  if (!vaga?.titulo) missing.push('titulo');
  if (!vaga?.empresa?.nome) missing.push('empresa.nome');
  if (!vaga?.senioridade) missing.push('senioridade');
  if (!vaga?.area) missing.push('area');
  if (!vaga?.localizacao) missing.push('localizacao');
  if (!vaga?.tipo_contrato) missing.push('tipo_contrato');
  if (!vaga?.salario_faixa) missing.push('salario_faixa');
  if (!vaga?.responsabilidades?.length) missing.push('responsabilidades');
  if (!vaga?.requisitos?.experiencia) missing.push('requisitos.experiencia');
  if (!vaga?.beneficios?.length) missing.push('beneficios');
  
  return missing;
}

function getNestedValue(obj: JobData['vaga'], path: string): unknown {
  if (!obj || !path) return undefined;
  
  try {
    let current: unknown = obj;
    const keys = path.split('.');
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  } catch (error: unknown) {
    return undefined;
  }
}