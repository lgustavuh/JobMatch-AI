import { NextRequest, NextResponse } from 'next/server';

interface UserProfile {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  education?: string | null;
  experience?: string | null;
  skills?: string[] | null;
  certifications?: string[] | null;
  projects?: string[] | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText } = body;
    
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'Texto do currículo é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }

    // Verificar se tem API key do OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key não configurada, usando fallback parsing');
      const basicProfile = extractBasicProfile(resumeText);
      return NextResponse.json({ profile: basicProfile });
    }

    try {
      // Fazer chamada para API de IA (OpenAI) com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em extração de dados de currículos. Analise o texto do currículo fornecido e extraia as informações pessoais e profissionais.

Retorne um JSON com o seguinte formato:
{
  "fullName": "string ou null",
  "email": "string ou null", 
  "phone": "string ou null",
  "address": "string ou null",
  "education": "string ou null",
  "experience": "string ou null",
  "skills": ["array de strings ou null"],
  "certifications": ["array de strings ou null"],
  "projects": ["array de strings ou null"]
}

Diretrizes:
1. Extraia APENAS informações claramente presentes no texto
2. Para campos não encontrados, use null
3. Para arrays, use null se não houver informações
4. Para education e experience, combine múltiplas entradas em uma string
5. Para skills, extraia apenas habilidades técnicas específicas
6. Para certifications, inclua certificações, cursos e qualificações
7. Para projects, inclua projetos mencionados no currículo

Seja preciso e não invente informações que não estão no texto.`
            },
            {
              role: 'user',
              content: `Extraia as informações deste currículo:\n\n${resumeText}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`OpenAI API error: ${response.status} - ${response.statusText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
        throw new Error('Resposta inválida da API OpenAI');
      }

      const content = aiResponse.choices[0].message.content;

      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Tentar parsear o JSON
      let parsedResult: UserProfile;
      try {
        parsedResult = JSON.parse(content);
      } catch {
        // Se falhar o parse, tentar extrair JSON do texto
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[0]);
          } catch {
            throw new Error('Não foi possível extrair JSON válido da resposta');
          }
        } else {
          throw new Error('Não foi possível extrair JSON válido da resposta');
        }
      }

      // Validar e limpar dados
      const profile: UserProfile = {
        fullName: parsedResult.fullName || null,
        email: parsedResult.email || null,
        phone: parsedResult.phone || null,
        address: parsedResult.address || null,
        education: parsedResult.education || null,
        experience: parsedResult.experience || null,
        skills: Array.isArray(parsedResult.skills) ? parsedResult.skills.filter(s => s && s.trim()) : null,
        certifications: Array.isArray(parsedResult.certifications) ? parsedResult.certifications.filter(c => c && c.trim()) : null,
        projects: Array.isArray(parsedResult.projects) ? parsedResult.projects.filter(p => p && p.trim()) : null
      };

      return NextResponse.json({ profile });

    } catch (apiError) {
      console.error('Erro na chamada da API OpenAI:', apiError);
      
      // Fallback: usar extração básica local
      const basicProfile = extractBasicProfile(resumeText);
      return NextResponse.json({ profile: basicProfile });
    }

  } catch (error) {
    console.error('Erro geral na API de extração de perfil:', error);
    
    // Último fallback: tentar extrair o resumeText do request novamente
    try {
      const body = await request.json();
      const { resumeText } = body;
      
      if (resumeText) {
        const basicProfile = extractBasicProfile(resumeText);
        return NextResponse.json({ profile: basicProfile });
      }
    } catch (fallbackError) {
      console.error('Erro no fallback final:', fallbackError);
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno na extração do perfil',
        profile: null
      },
      { status: 500 }
    );
  }
}

// Função de fallback para extração básica
function extractBasicProfile(text: string): UserProfile {
  const profile: UserProfile = {};
  
  try {
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
    
    // Extrair endereço (procurar por padrões de cidade/estado)
    const addressMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/);
    if (addressMatch) {
      profile.address = addressMatch[1];
    }
    
    // Extrair formação
    const educationMatch = text.match(/(?:formação|educação|education)[:s]*([^]*?)(?:\n\n|\nexperiência|\nexp|$)/i);
    if (educationMatch) {
      profile.education = educationMatch[1].trim().substring(0, 500);
    }
    
    // Extrair experiência
    const experienceMatch = text.match(/(?:experiência|experience)[:s]*([^]*?)(?:\n\n|\nformação|\neducação|$)/i);
    if (experienceMatch) {
      profile.experience = experienceMatch[1].trim().substring(0, 1000);
    }
    
    // Extrair habilidades
    const skillsSection = text.match(/(?:habilidades|competências|skills)[:s]*([^]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (skillsSection) {
      const skills = skillsSection[1]
        .split(/[,\n•-]/)
        .map(s => s.trim())
        .filter(s => s && s.length > 2 && s.length < 50)
        .slice(0, 20); // Limitar a 20 skills
      
      if (skills.length > 0) {
        profile.skills = skills;
      }
    }
    
    // Extrair certificações
    const certificationsMatch = text.match(/(?:certificações|certificados|certifications)[:s]*([^]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (certificationsMatch) {
      const certifications = certificationsMatch[1]
        .split(/\n/)
        .map(c => c.replace(/^[•-]\s*/, '').trim())
        .filter(c => c && c.length > 5)
        .slice(0, 10); // Limitar a 10 certificações
      
      if (certifications.length > 0) {
        profile.certifications = certifications;
      }
    }
    
    // Extrair projetos
    const projectsMatch = text.match(/(?:projetos|projects)[:s]*([^]*?)(?:\n\n|\n[A-Z]|$)/i);
    if (projectsMatch) {
      const projects = projectsMatch[1]
        .split(/\n/)
        .map(p => p.replace(/^[•-]\s*/, '').trim())
        .filter(p => p && p.length > 10)
        .slice(0, 10); // Limitar a 10 projetos
      
      if (projects.length > 0) {
        profile.projects = projects;
      }
    }
    
    // Garantir que campos vazios sejam null
    Object.keys(profile).forEach(key => {
      const value = profile[key as keyof UserProfile];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        profile[key as keyof UserProfile] = null;
      }
    });
    
  } catch (extractionError) {
    console.error('Erro na extração básica:', extractionError);
  }
  
  return profile;
}