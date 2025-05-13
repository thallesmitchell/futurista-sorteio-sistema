
import { jsPDF } from 'jspdf';
import { DailyDraw } from '@/contexts/game/types';
import { PDF_CONFIG } from './base-pdf';
import { formatDate } from '@/lib/date';

/**
 * Renderiza um número dentro de um círculo verde
 */
const renderNumberCircle = (
  pdf: jsPDF,
  number: number,
  x: number,
  y: number,
  size = 8 // Tamanho do círculo
): void => {
  // Salvar estado atual
  pdf.saveGraphicsState();
  
  // Desenhar círculo verde
  pdf.setFillColor(39, 174, 96); // Verde escuro
  pdf.circle(x, y, size, 'F');
  
  // Adicionar texto do número
  pdf.setTextColor(255, 255, 255); // Texto branco
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11); // Tamanho da fonte
  
  // Formatar número com zero à esquerda se necessário
  const formattedNumber = String(number).padStart(2, '0');
  
  // Calcular posição do texto para centralizar
  const textWidth = pdf.getStringUnitWidth(formattedNumber) * pdf.getFontSize() / pdf.internal.scaleFactor;
  const textX = x - (textWidth / 2);
  const textY = y + 1; // Ajustado para melhor centralização vertical
  
  pdf.text(formattedNumber, textX, textY);
  
  // Restaurar estado
  pdf.restoreGraphicsState();
};

/**
 * Adiciona a seção de sorteios ao PDF
 * 
 * @param pdf Documento PDF
 * @param draws Lista de sorteios diários
 * @param startY Posição Y inicial
 * @returns Nova posição Y após adicionar a seção
 */
export const addDrawsSection = (
  pdf: jsPDF,
  draws: DailyDraw[],
  startY: number
): number => {
  if (!draws || !Array.isArray(draws) || draws.length === 0) {
    console.log('Nenhum sorteio para mostrar');
    return startY;
  }
  
  // Adicionando espaço adequado antes da seção
  let yPosition = startY + 10;
  
  // Título da seção
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.fontSizes.subtitle);
  pdf.setTextColor(39, 174, 96); // Verde escuro
  pdf.text('Sorteios Realizados', PDF_CONFIG.pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10; // Espaçamento adequado após título
  
  // Ordenar sorteios do mais recente para o mais antigo
  const sortedDraws = [...draws].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Renderizar cada sorteio
  sortedDraws.forEach((draw, drawIndex) => {
    // Verificar se precisa adicionar uma nova página
    if (yPosition > PDF_CONFIG.pageHeight - 30) {
      pdf.addPage();
      yPosition = PDF_CONFIG.margin;
    }
    
    // Formatar e mostrar a data do sorteio
    let dateText = 'Data indisponível';
    try {
      dateText = `Sorteio de ${formatDate(draw.date)}`;
    } catch (error) {
      console.error('Erro formatando data do sorteio:', error);
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.fontSizes.normal);
    pdf.setTextColor(0, 0, 0);
    pdf.text(dateText, PDF_CONFIG.margin, yPosition);
    
    yPosition += 8; // Espaçamento adequado
    
    // Verificar se há números para mostrar
    if (!draw.numbers || !Array.isArray(draw.numbers) || draw.numbers.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(PDF_CONFIG.fontSizes.small);
      pdf.text('Nenhum número registrado neste sorteio.', PDF_CONFIG.margin, yPosition);
      yPosition += 5;
      return;
    }
    
    // Ordenar números
    const sortedNumbers = [...draw.numbers].sort((a, b) => a - b);
    
    // Definir layout para os números
    const circleRadius = 4;
    const circleSpacing = 10;
    const maxCirclesPerRow = Math.floor((PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2)) / circleSpacing);
    
    // Renderizar números em círculos
    sortedNumbers.forEach((number, index) => {
      const row = Math.floor(index / maxCirclesPerRow);
      const col = index % maxCirclesPerRow;
      
      const circleX = PDF_CONFIG.margin + circleRadius + (col * circleSpacing);
      const circleY = yPosition + circleRadius + (row * circleSpacing);
      
      renderNumberCircle(pdf, number, circleX, circleY, circleRadius);
    });
    
    // Calcular quantas linhas ocupamos
    const rowsUsed = Math.ceil(sortedNumbers.length / maxCirclesPerRow);
    yPosition += (rowsUsed * circleSpacing) + 8; // Espaçamento adequado
    
    // Adicionar linha separadora entre sorteios (exceto após o último)
    if (drawIndex < sortedDraws.length - 1) {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(PDF_CONFIG.margin, yPosition - 2, PDF_CONFIG.pageWidth - PDF_CONFIG.margin, yPosition - 2);
      yPosition += 5; // Espaçamento adequado
    }
  });
  
  // Adicionar separador mais visível após a seção de sorteios
  yPosition += 5;
  pdf.setDrawColor(39, 174, 96); // Verde
  pdf.setLineWidth(0.8);
  pdf.line(
    PDF_CONFIG.margin, 
    yPosition, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    yPosition
  );
  
  return yPosition + 10; // Espaçamento adequado para a próxima seção
};

/**
 * Obtém a data do último sorteio de um jogo
 * Se não houver sorteios, retorna null
 */
export const getLastDrawDate = (draws: DailyDraw[]): Date | null => {
  if (!draws || !Array.isArray(draws) || draws.length === 0) {
    return null;
  }
  
  // Encontra o sorteio mais recente
  const sortedDraws = [...draws].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return new Date(sortedDraws[0].date);
};
