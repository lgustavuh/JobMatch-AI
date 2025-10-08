// Extrator de dados de vagas de emprego
export interface JobExtractionInput {
  url: string;
  idioma: string;
  campos_extras?: string[];
}

export interface JobExtractionResult {
  fonte: {
    url: string;
    dominio: string;
    capturado_em: string;
  };
  vaga: {
    titulo: string;
    senioridade: string | null;
    area: string | null;
    empresa: {
      nome: string;
      descricao_curta: string | null;
      local_trabalho: string | null;
      modelo_trabalho: 'presencial' | 'hibrido' | 'remoto' | null;
      tempo_de_mercado: string | null;
      selo_cultural_reconhecimentos: string[];
    };
    localizacao: string | null;
    tipo_contrato: string | null;
    carga_horaria: string | null;
    salario_faixa: string | null;
    beneficios: string[];
    responsabilidades: string[];
    requisitos: {
      formacao: string[];
      experiencia: string | null;
      competencias_comportamentais: string[];
      competencias_tecnicas: string[];
      diferenciais: string[];
    };
    processo_seletivo_etapas: string[];
    data_publicacao: string | null;
    data_encerramento: string | null;
  };
  resumo_curto: string;
  metadados: {
    lingua_detectada: string;
    confianca_extracao: number;
    campos_ausentes: string[];
  };
}

export interface JobExtractionError {
  erro: true;
  mensagem: string;
  url: string;
}

// Função para extrair dados de uma vaga de emprego
export async function extractJobData(input: JobExtractionInput): Promise<JobExtractionResult | JobExtractionError> {
  try {
    const { url, idioma } = input;
    
    // Validar URL
    if (!url || !isValidUrl(url)) {
      return {
        erro: true,
        mensagem: "URL inválida fornecida.",
        url: url || ''
      };
    }

    // CORREÇÃO: Usar API do backend em vez de fetch direto
    const response = await fetch('/api/parse-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        idioma,
        campos_extras: input.campos_extras
      })
    });

    if (!response.ok) {
      console.error(`API parse-job retornou status ${response.status} para URL: ${url}`);
      return {
        erro: true,
        mensagem: `Não foi possível acessar a URL. Status: ${response.status}`,
        url
      };
    }

    const result = await response.json();
    
    // Se a API retornou um erro
    if (result.erro) {
      console.error('API retornou erro para URL:', url, result.mensagem);
      return result;
    }

    // Se a API retornou dados válidos
    if (result.vaga && result.fonte) {
      return result;
    }

    // Se não tem estrutura esperada, retornar erro
    console.error('Resposta da API não tem estrutura esperada:', result);
    return {
      erro: true,
      mensagem: "Conteúdo insuficiente para extração.",
      url
    };

  } catch (error) {
    console.error('Erro na extração de dados da vaga:', error);
    return {
      erro: true,
      mensagem: error instanceof Error ? error.message : "Erro interno durante a extração.",
      url: input.url
    };
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

// Função para detectar senioridade
export function detectSeniority(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('junior') || lowerText.includes('júnior') || lowerText.includes('jr')) {
    return 'junior';
  }
  if (lowerText.includes('pleno') || lowerText.includes('mid-level')) {
    return 'pleno';
  }
  if (lowerText.includes('senior') || lowerText.includes('sênior') || lowerText.includes('sr')) {
    return 'senior';
  }
  if (lowerText.includes('especialista') || lowerText.includes('expert') || lowerText.includes('lead')) {
    return 'especialista';
  }
  
  return null;
}

// Função para detectar modelo de trabalho
export function detectWorkModel(text: string): 'presencial' | 'hibrido' | 'remoto' | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('remoto') || lowerText.includes('remote') || lowerText.includes('home office')) {
    return 'remoto';
  }
  if (lowerText.includes('híbrido') || lowerText.includes('hibrido') || lowerText.includes('hybrid')) {
    return 'hibrido';
  }
  if (lowerText.includes('presencial') || lowerText.includes('on-site') || lowerText.includes('escritório')) {
    return 'presencial';
  }
  
  return null;
}

// Função para calcular confiança da extração
export function calculateExtractionConfidence(data: JobExtractionResult): number {
  let score = 0;
  let totalFields = 0;
  
  // Campos obrigatórios (peso maior)
  const requiredFields = ['titulo', 'empresa.nome'];
  requiredFields.forEach(field => {
    totalFields += 2;
    if (getNestedValue(data.vaga, field)) {
      score += 2;
    }
  });
  
  // Campos importantes (peso médio)
  const importantFields = ['senioridade', 'area', 'localizacao', 'responsabilidades', 'requisitos.experiencia'];
  importantFields.forEach(field => {
    totalFields += 1;
    const value = getNestedValue(data.vaga, field);
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      score += 1;
    }
  });
  
  // Campos opcionais (peso menor)
  const optionalFields = ['beneficios', 'requisitos.competencias_tecnicas', 'processo_seletivo_etapas'];
  optionalFields.forEach(field => {
    totalFields += 0.5;
    const value = getNestedValue(data.vaga, field);
    if (value && Array.isArray(value) && value.length > 0) {
      score += 0.5;
    }
  });
  
  return Math.min(Math.round((score / totalFields) * 100) / 100, 1);
}

// Função auxiliar para acessar valores aninhados
function getNestedValue(obj: JobExtractionResult['vaga'], path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key as keyof typeof current], obj);
}

// Função para limpar conteúdo HTML
export function cleanHtmlContent(html: string): string {
  // Remover scripts e styles
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remover tags HTML mas manter quebras de linha importantes
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<\/?(div|p|h[1-6]|li|section|article)[^>]*>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  
  // Limpar espaços e quebras excessivas
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  cleaned = cleaned.trim();
  
  return cleaned;
}