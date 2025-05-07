
import jsPDF from 'jspdf';
import { Game, Player } from '@/contexts/game/types';
import { addFonts, loadFonts } from './fonts';
import { formatDate } from '@/lib/date';
import autoTable from 'jspdf-autotable';
import { addPlayersToReport } from './components/players-list';
import { createReportContainer, addHeaderToReport } from './components/container';

// Use inline type definition
type PlayerCombination = {
  numbers: number[];
  hits: number;
};

// PDF generation configuration
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 15,
  titleFontSize: 18,
  subtitleFontSize: 14,
  headerFontSize: 12,
  textFontSize: 10,
  smallTextFontSize: 8,
  lineHeight: 7,
  innerMargin: 5,
  ballSize: 9, // Aumentado conforme solicitado
}

// Initialize PDF document
export const createPDF = async (): Promise<jsPDF> => {
  // Create new document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Load and register fonts
  await loadFonts(pdf);
  addFonts(pdf);
  
  return pdf;
}

// Add header section to PDF
export const addHeader = (
  pdf: jsPDF, 
  gameTitle: string, 
  date: Date | string = new Date(), 
  options = { color: '#000000' }
): void => {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  const textWidth = pdf.getStringUnitWidth(`${gameTitle}`) * PDF_CONFIG.titleFontSize / pdf.internal.scaleFactor;
  const centerX = (PDF_CONFIG.pageWidth - textWidth) / 2;

  // Add title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.titleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Resultado', PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin, { align: 'center' });
  
  // Add date
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.text(formattedDate, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 10, { align: 'center' });
  
  // Add game name
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.headerFontSize);
  pdf.text(gameTitle, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 20, { align: 'center' });
  
  // Add separator line
  pdf.setDrawColor(options.color);
  pdf.line(
    PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margin, 
    PDF_CONFIG.margin + 25
  );
}

// Create a ball with number
export const drawBall = (
  pdf: jsPDF, 
  x: number, 
  y: number, 
  number: number, 
  options = { 
    size: PDF_CONFIG.ballSize, 
    colorFill: '#39FF14',
    colorBorder: '#39FF14',
    colorText: '#FFFFFF',
    isHit: true
  }
): void => {
  const radius = options.size;
  const formattedNumber = String(number).padStart(2, '0');
  
  // Se é um acerto, preenche com cor, caso contrário apenas a borda
  if (options.isHit) {
    pdf.setFillColor(options.colorFill);
    pdf.circle(x, y, radius, 'F');
    pdf.setTextColor(options.colorText);
    pdf.setFont('helvetica', 'bold'); // Extra bold para números acertados
  } else {
    pdf.setDrawColor(options.colorBorder);
    pdf.circle(x, y, radius, 'D');
    pdf.setTextColor(options.colorBorder);
    pdf.setFont('helvetica', 'normal'); // Normal para não acertados
  }
  
  // Add number to ball
  pdf.setFontSize(PDF_CONFIG.smallTextFontSize);
  
  // Calculate the width of the text to center it within the ball
  const textWidth = pdf.getStringUnitWidth(formattedNumber) * PDF_CONFIG.smallTextFontSize / pdf.internal.scaleFactor;
  const textX = x - (textWidth / 2);
  
  // Add the text centered vertically and horizontally in the ball
  pdf.text(formattedNumber, textX, y + 1.5);
}

// Add "Jogos Amarrados" section (near winners with 5 hits)
export const addNearWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  options = { color: '#39FF14' }
): number => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Find players with combinations that have exactly 5 hits
  const nearWinners = game.players
    .filter(player => player.combinations.some(combo => combo.hits === 5))
    .map(player => {
      const nearWinningCombos = player.combinations.filter(combo => combo.hits === 5);
      return { player, combos: nearWinningCombos };
    })
    .filter(item => item.combos.length > 0);
    
  // Se não há quase ganhadores, retorna a posição atual
  if (nearWinners.length === 0) {
    return PDF_CONFIG.margin + 30; // Retorna posição após o cabeçalho
  }
  
  // Título da seção
  let currentY = PDF_CONFIG.margin + 35;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Jogos Amarrados', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Descrição
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(PDF_CONFIG.textFontSize);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  currentY += 15; // Aumentado para dar mais espaço entre título e boxes
  
  // Boxes para cada quase ganhador - agora em coluna única, 100% de largura
  const boxWidth = PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2);
  
  nearWinners.forEach((item, index) => {
    // Desenha box do jogador
    pdf.setDrawColor(options.color);
    pdf.setFillColor('#f8f8f8');
    pdf.roundedRect(PDF_CONFIG.margin, currentY, boxWidth, 60, 3, 3, 'FD'); // Altura aumentada
    
    // Nome do jogador
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.headerFontSize);
    pdf.setTextColor('#000000');
    pdf.text(item.player.name, PDF_CONFIG.pageWidth / 2, currentY + 10, { align: 'center' });
    
    // Para cada combinação com 5 acertos
    let comboY = currentY + 25; // Posição vertical ajustada
    
    item.combos.forEach((combo, comboIndex) => {
      if (comboIndex > 0) {
        comboY += 15; // Espaçamento entre combinações
      }
      
      // Limitado às primeiras combinações devido a restrições de espaço
      if (comboIndex < 3) {
        // Números
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        // Calcula posição inicial para centralizar os números
        const totalWidth = sortedNumbers.length * (PDF_CONFIG.ballSize * 3); 
        let numberX = (PDF_CONFIG.pageWidth - totalWidth) / 2 + PDF_CONFIG.ballSize;
        
        sortedNumbers.forEach((number, i) => {
          const isHit = drawnNumbersSet.has(number);
          drawBall(pdf, 
            numberX + (i * (PDF_CONFIG.ballSize * 2.5)), // 20px entre círculos
            comboY, 
            number, 
            {
              size: PDF_CONFIG.ballSize + 2, // Círculos maiores conforme solicitado
              colorFill: options.color,
              colorBorder: options.color,
              colorText: '#FFFFFF',
              isHit
            }
          );
        });
      } else if (comboIndex === 3) {
        // Indica que há mais combinações
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(PDF_CONFIG.smallTextFontSize);
        pdf.text(`+ ${item.combos.length - 3} mais sequências com 5 acertos`, PDF_CONFIG.pageWidth / 2, comboY, { align: 'center' });
      }
    });
    
    // Atualiza posição Y para próximo jogador
    currentY += 70; // Altura do box + espaçamento
  });
  
  // Retorna a posição Y final após a seção de quase ganhadores
  return currentY + 10;
}

// Add winners section to PDF
export const addWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  startY: number,
  options = { color: '#39FF14' }
): number => {
  // Se não há ganhadores, retorna a posição atual
  if (!game.winners || game.winners.length === 0) {
    return startY;
  }
  
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Título da seção
  let currentY = startY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('🏆 Ganhadores 🏆', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15; // Aumentado para melhor espaçamento
  
  // Bloco de ganhadores
  const winners = game.winners.map(winner => {
    const playerData = game.players.find(p => p.id === winner.id);
    if (!playerData) return null;
    
    const winningCombos = playerData.combinations.filter(c => c.hits === 6);
    return { player: playerData, winningCombos };
  }).filter(Boolean) as { player: Player, winningCombos: PlayerCombination[] }[];
  
  // Design melhorado para ganhadores
  winners.forEach((winner) => {
    // Box do ganhador com design melhorado
    pdf.setDrawColor(options.color);
    pdf.setFillColor('#e8ffd7'); // Fundo claro para maior destaque
    pdf.roundedRect(
      PDF_CONFIG.margin, 
      currentY, 
      PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
      25 + (winner.winningCombos.length * 20), // Altura aumentada
      5, // Bordas mais arredondadas
      5, 
      'FD'
    );
    
    // Nome do ganhador com troféu em destaque
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.subtitleFontSize); // Fonte maior
    pdf.setTextColor('#247c00'); // Verde mais escuro para destaque
    pdf.text(`🏆 ${winner.player.name} 🏆`, PDF_CONFIG.pageWidth / 2, currentY + 12, { align: 'center' });
    
    // Combinações vencedoras
    let comboY = currentY + 25;
    
    winner.winningCombos.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Calcula posição inicial para centralizar os números
      const totalWidth = sortedNumbers.length * (PDF_CONFIG.ballSize * 3); 
      let startX = (PDF_CONFIG.pageWidth - totalWidth) / 2 + PDF_CONFIG.ballSize;
      
      // Deseja cada número
      sortedNumbers.forEach((number, i) => {
        drawBall(pdf, 
          startX + (i * (PDF_CONFIG.ballSize * 3)), // Espaçamento maior para destaque
          comboY, 
          number, 
          {
            size: PDF_CONFIG.ballSize + 3, // Tamanho maior para destaque
            colorFill: '#009e1a', // Verde mais vibrante
            colorBorder: '#009e1a',
            colorText: '#FFFFFF',
            isHit: true
          }
        );
      });
      
      comboY += 20;
    });
    
    // Atualiza posição Y para próximo ganhador
    currentY = comboY + 15;
  });
  
  return currentY + 5;
}

// Add players section to PDF - substituído pela versão HTML/DOM
export const addPlayersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[],
  startY: number,
  options = { color: '#39FF14', maxCombosPerPlayer: 1000 } // Aumentado para mostrar TODAS as sequências
): void => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add section title
  let currentY = startY;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor('#000000');
  pdf.text('Jogadores', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  
  // Prepare sorted players (alphabetically)
  const sortedPlayers = [...game.players].sort((a, b) => a.name.localeCompare(b.name));
  
  // Create table data for players
  const tableData = [];
  
  // Process each player's data for the table
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    
    // Get max hits for player
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    
    // Sort combinations by hits (highest first)
    const sortedCombos = [...player.combinations].sort((a, b) => b.hits - a.hits);
    
    // Create player row data
    const playerData = [
      { content: player.name, styles: { fontStyle: 'bold' } }, 
      { content: `${player.combinations.length} sequência(s)\nMáx. acertos: ${maxHits}`, styles: {} }
    ];
    
    tableData.push(playerData);
    
    // Add ALL combinations (no limit)
    sortedCombos.forEach((combo, idx) => {
      const numberCells = [];
      
      // Sort the numbers
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create a formatted string for the number sequence with highlight for hits
      let numbersText = '';
      sortedNumbers.forEach(num => {
        const formatted = String(num).padStart(2, '0');
        const hit = drawnNumbersSet.has(num);
        
        if (hit) {
          numbersText += `[${formatted}] `; // Highlight hit numbers
        } else {
          numbersText += `${formatted} `;
        }
      });
      
      // Add the sequence row with indentation and hit count
      tableData.push([
        '', // Repete o nome do jogador em caso de quebra de página
        { content: `${combo.hits} acerto${combo.hits !== 1 ? 's' : ''}:`, styles: {} }, 
        { content: numbersText, styles: {} }
      ]);
    });
    
    // Add spacer row between players with line
    if (i < sortedPlayers.length - 1) {
      tableData.push([
        { content: '', styles: { borderTop: '2px dashed #aaaaaa' } },
        { content: '', styles: { borderTop: '2px dashed #aaaaaa' } },
        { content: '', styles: { borderTop: '2px dashed #aaaaaa' } }
      ]);
    }
  }
  
  // Configure and create the table with repetição de cabeçalhos
  autoTable(pdf, {
    startY: currentY,
    head: [['Jogador', 'Detalhes', 'Sequências']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [50, 50, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'normal' },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    didParseCell: function(data) {
      // Estilo para números com 6 acertos em verde
      if (data.section === 'body' && data.column.index === 1 && data.cell.text && data.cell.text.toString().includes('6 acerto')) {
        data.cell.styles.textColor = [0, 150, 0];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Marcador visual para números acertados entre colchetes
      if (data.section === 'body' && data.column.index === 2) {
        const text = data.cell.text ? data.cell.text.toString() : '';
        if (text.includes('[')) {
          data.cell.styles.textColor = [0, 150, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    // Repetir o cabeçalho e o nome do jogador em quebras de página
    didDrawPage: function(data) {
      // Cabeçalhos já são repetidos automaticamente
    },
    rowPageBreak: 'auto', // Auto quebra de linha
    showFoot: 'everyPage',
    tableLineWidth: 0.2,
    tableLineColor: [80, 80, 80]
  });
}

// Generate and download complete PDF report
export const generateGameReport = async (
  game: Game,
  options = { 
    themeColor: '#39FF14',
    filename: 'resultado.pdf',
    includeNearWinners: true
  }
): Promise<void> => {
  try {
    console.log('Iniciando geração de PDF para o jogo:', game.name);
    
    // Obter todos os números sorteados do jogo
    const allDrawnNumbers = game.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
    
    // Inicializar PDF
    const pdf = await createPDF();
    
    // Adicionar cabeçalho
    addHeader(pdf, game.name, new Date(), { color: options.themeColor });
    
    // Controlar posição Y atual
    let currentY = PDF_CONFIG.margin + 30;
    
    // Se houver ganhadores, não adiciona seção de jogos amarrados
    const hasWinners = game.winners && game.winners.length > 0;
    
    // Adicionar seção de quase ganhadores se solicitado e não houver ganhadores
    if (options.includeNearWinners && !hasWinners) {
      currentY = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor });
    }
    
    // Adicionar seção de ganhadores
    currentY = addWinnersSection(pdf, game, allDrawnNumbers, currentY, { color: options.themeColor });
    
    // Verificar se precisamos de uma nova página antes da seção de jogadores
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin;
    }
    
    // Adicionar seção de jogadores
    addPlayersSection(pdf, game, allDrawnNumbers, currentY, { 
      color: options.themeColor,
      maxCombosPerPlayer: 1000 // Mostrar todas as sequências
    });
    
    // Usar o nome de arquivo fornecido ou gerar um
    const filename = options.filename || `resultado-${game.name.replace(/\s+/g, '-')}.pdf`;
    
    // Salvar o PDF
    pdf.save(filename);
    
    console.log('Geração do PDF concluída com sucesso');
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Promise.reject(error);
  }
}
