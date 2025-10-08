// Funções auxiliares para download de arquivos
import { UserProfile } from './types';

// Função para gerar PDF usando jsPDF
export const generatePDF = async (content: string, filename: string = 'curriculo.pdf'): Promise<void> => {
  try {
    // Importação dinâmica para evitar problemas de SSR
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Configurar fonte e tamanho
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Dividir o conteúdo em linhas
    const lines = content.split('\n');
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    lines.forEach((line) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Dividir linhas muito longas
      const maxWidth = 170;
      const splitLines = doc.splitTextToSize(line, maxWidth);
      
      splitLines.forEach((splitLine: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(splitLine, 20, yPosition);
        yPosition += lineHeight;
      });
    });
    
    // Fazer download do arquivo
    doc.save(filename);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Não foi possível gerar o PDF. Tente novamente.');
  }
};

// Função para gerar DOCX usando docx
export const generateDOCX = async (content: string, filename: string = 'curriculo.docx'): Promise<void> => {
  try {
    // Importação dinâmica para evitar problemas de SSR
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    
    // Dividir o conteúdo em parágrafos
    const lines = content.split('\n');
    const paragraphs = lines.map(line => {
      if (line.trim() === '') {
        return new Paragraph({
          children: [new TextRun({ text: '', break: 1 })]
        });
      }
      
      // Verificar se é um título (linhas que começam com ===)
      if (line.startsWith('===')) {
        const title = line.replace(/=/g, '').trim();
        return new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 28,
              color: '2E74B5'
            })
          ],
          spacing: { after: 200 }
        });
      }
      
      // Verificar se é um item de lista (linhas que começam com •)
      if (line.startsWith('•')) {
        return new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22
            })
          ],
          bullet: { level: 0 },
          spacing: { after: 100 }
        });
      }
      
      // Parágrafo normal
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 22
          })
        ],
        spacing: { after: 100 }
      });
    });
    
    // Criar documento
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });
    
    // Gerar e fazer download do arquivo
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar DOCX:', error);
    throw new Error('Não foi possível gerar o DOCX. Tente novamente.');
  }
};

// Função para gerar conteúdo formatado do currículo
export const formatResumeContent = (userProfile: UserProfile, jobTitle?: string): string => {
  const content = `
CURRÍCULO PROFISSIONAL${jobTitle ? ` - ${jobTitle}` : ''}

=== INFORMAÇÕES PESSOAIS ===
Nome: ${userProfile.fullName || '[Seu Nome]'}
Email: ${userProfile.email || '[seu.email@exemplo.com]'}
Telefone: ${userProfile.phone || '[seu telefone]'}
Endereço: ${userProfile.address || '[seu endereço]'}

=== RESUMO PROFISSIONAL ===
${userProfile.experience ? 
  `Profissional com experiência comprovada na área. ${userProfile.experience.substring(0, 200)}...` :
  'Profissional em busca de oportunidades para aplicar conhecimentos e contribuir para o crescimento da empresa.'
}

=== FORMAÇÃO ACADÊMICA ===
${userProfile.education || '[Curso] - [Instituição] (Ano)'}

=== EXPERIÊNCIA PROFISSIONAL ===
${userProfile.experience || `[Cargo Anterior] - [Empresa] (Período)
• Desenvolveu soluções e participou de projetos importantes
• Trabalhou em equipe seguindo metodologias ágeis
• Contribuiu para melhorias significativas nos processos`}

=== HABILIDADES TÉCNICAS ===
${userProfile.skills && userProfile.skills.length > 0 ? 
  userProfile.skills.map(skill => `• ${skill}`).join('\n') :
  '• Comunicação\n• Trabalho em equipe\n• Proatividade\n• Resolução de problemas'
}

=== PROJETOS RELEVANTES ===
${userProfile.projects && userProfile.projects.length > 0 ?
  userProfile.projects.map(project => `• ${project}`).join('\n') :
  '• Projeto 1: Descrição do projeto desenvolvido\n• Projeto 2: Descrição do projeto desenvolvido'
}

=== CERTIFICAÇÕES ===
${userProfile.certifications && userProfile.certifications.length > 0 ?
  userProfile.certifications.map(cert => `• ${cert}`).join('\n') :
  '• Certificação relevante para a área\n• Curso de especialização'
}

---
Currículo gerado automaticamente pelo Sistema de Análise de Currículos
  `.trim();
  
  return content;
};