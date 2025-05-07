
import jsPDF from 'jspdf';
import { Game, Player, PlayerCombination } from '@/contexts/game/types';
import { addFonts, loadFonts } from './fonts';
import { formatDate } from '@/lib/date';
import autoTable from 'jspdf-autotable';

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
  ballSize: 7,
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
  pdf.setFont('Inter-Bold');
  pdf.setFontSize(PDF_CONFIG.titleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Resultado', PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin, { align: 'center' });
  
  // Add date
  pdf.setFont('Inter-Medium');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.text(formattedDate, PDF_CONFIG.pageWidth / 2, PDF_CONFIG.margin + 10, { align: 'center' });
  
  // Add game name
  pdf.setFont('Inter-Regular');
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
  
  // If it's a hit, fill with color, otherwise just the border
  if (options.isHit) {
    pdf.setFillColor(options.colorFill);
    pdf.circle(x, y, radius, 'F');
    pdf.setTextColor(options.colorText);
  } else {
    pdf.setDrawColor(options.colorBorder);
    pdf.circle(x, y, radius, 'D');
    pdf.setTextColor(options.colorBorder);
  }
  
  // Add number to ball
  pdf.setFont('Inter-Bold');
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
    
  // If there are no near winners, return the current position (no section added)
  if (nearWinners.length === 0) {
    return PDF_CONFIG.margin + 30; // Return position after header
  }
  
  // Add section title
  let currentY = PDF_CONFIG.margin + 35;
  pdf.setFont('Inter-Bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Jogos Amarrados', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Add description
  pdf.setFont('Inter-Regular');
  pdf.setFontSize(PDF_CONFIG.textFontSize);
  pdf.setTextColor('#000000');
  pdf.text(
    'Jogadores com 5 acertos (falta apenas 1 número para ganhar)',
    PDF_CONFIG.pageWidth / 2, 
    currentY,
    { align: 'center' }
  );
  
  currentY += 10;
  
  // Create rectangles for each near winner
  const boxWidth = (PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2) - 10) / 2; // Two columns
  let boxX = PDF_CONFIG.margin;
  
  nearWinners.forEach((item, index) => {
    // New row every 2 items
    if (index > 0 && index % 2 === 0) {
      boxX = PDF_CONFIG.margin;
      currentY += 55; // Height of the previous row of boxes
    }
    
    // Draw player box
    pdf.setDrawColor(options.color);
    pdf.setFillColor('#f8f8f8');
    pdf.roundedRect(boxX, currentY, boxWidth, 50, 3, 3, 'FD');
    
    // Player name
    pdf.setFont('Inter-Bold');
    pdf.setFontSize(PDF_CONFIG.headerFontSize);
    pdf.setTextColor('#000000');
    pdf.text(item.player.name, boxX + (boxWidth / 2), currentY + 7, { align: 'center' });
    
    // For each combination with 5 hits
    let comboY = currentY + 15;
    
    item.combos.forEach((combo, comboIndex) => {
      if (comboIndex > 0) {
        comboY += 15; // Spacing between combinations
      }
      
      // Only show up to 2 combinations per player due to space constraints
      if (comboIndex < 2) {
        // Draw numbers
        let numberX = boxX + 5;
        const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
        
        sortedNumbers.forEach((number, i) => {
          const isHit = drawnNumbersSet.has(number);
          drawBall(pdf, numberX + (i * (PDF_CONFIG.ballSize * 2.5)), comboY, number, {
            size: PDF_CONFIG.ballSize,
            colorFill: options.color,
            colorBorder: options.color,
            colorText: '#FFFFFF',
            isHit
          });
        });
      } else if (comboIndex === 2) {
        // Indicate there are more combinations
        pdf.setFont('Inter-Italic');
        pdf.setFontSize(PDF_CONFIG.smallTextFontSize);
        pdf.text(`+ ${item.combos.length - 2} mais sequências com 5 acertos`, boxX + (boxWidth / 2), comboY, { align: 'center' });
      }
    });
    
    // Move to next box position (next column)
    boxX += boxWidth + 10;
  });
  
  // Calculate the final Y position after the near winners section
  const sectionHeight = Math.ceil(nearWinners.length / 2) * 55;
  return currentY + sectionHeight + 10;
}

// Add winners section to PDF
export const addWinnersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[], 
  startY: number,
  options = { color: '#39FF14' }
): number => {
  // If there are no winners, return the current position
  if (!game.winners || game.winners.length === 0) {
    return startY;
  }
  
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add section title
  let currentY = startY;
  pdf.setFont('Inter-Bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor(options.color);
  pdf.text('Ganhadores', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 8;
  
  // Create winners block
  const winners = game.winners.map(winner => {
    const playerData = game.players.find(p => p.id === winner.id);
    if (!playerData) return null;
    
    const winningCombos = playerData.combinations.filter(c => c.hits === 6);
    return { player: playerData, winningCombos };
  }).filter(Boolean) as { player: Player, winningCombos: PlayerCombination[] }[];
  
  // Create rectangles for each winner
  winners.forEach((winner) => {
    // Draw winner box
    pdf.setDrawColor(options.color);
    pdf.setFillColor(options.color + '20'); // 20% opacity
    pdf.roundedRect(
      PDF_CONFIG.margin, 
      currentY, 
      PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2), 
      25 + (winner.winningCombos.length * 15), 
      3, 
      3, 
      'FD'
    );
    
    // Add trophy emoji and player name
    pdf.setFont('Inter-Bold');
    pdf.setFontSize(PDF_CONFIG.headerFontSize);
    pdf.setTextColor('#000000');
    pdf.text(`🏆 ${winner.player.name} 🏆`, PDF_CONFIG.pageWidth / 2, currentY + 8, { align: 'center' });
    
    // Add winning combinations
    let comboY = currentY + 20;
    
    winner.winningCombos.forEach(combo => {
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Calculate start position to center the numbers
      const totalWidth = sortedNumbers.length * (PDF_CONFIG.ballSize * 2.5); 
      let startX = (PDF_CONFIG.pageWidth - totalWidth) / 2;
      
      // Draw each number
      sortedNumbers.forEach((number, i) => {
        drawBall(pdf, startX + (i * (PDF_CONFIG.ballSize * 2.5)), comboY, number, {
          size: PDF_CONFIG.ballSize,
          colorFill: options.color,
          colorBorder: options.color,
          colorText: '#FFFFFF',
          isHit: true
        });
      });
      
      comboY += 15;
    });
    
    // Update Y position for next winner
    currentY = comboY + 10;
  });
  
  return currentY + 5;
}

// Add players section to PDF
export const addPlayersSection = (
  pdf: jsPDF, 
  game: Game, 
  allDrawnNumbers: number[],
  startY: number,
  options = { color: '#39FF14', maxCombosPerPlayer: 3 }
): void => {
  const drawnNumbersSet = new Set(allDrawnNumbers);
  
  // Add section title
  let currentY = startY;
  pdf.setFont('Inter-Bold');
  pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
  pdf.setTextColor('#000000');
  pdf.text('Jogadores', PDF_CONFIG.pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  
  // Prepare sorted players (alphabetically)
  const sortedPlayers = [...game.players].sort((a, b) => a.name.localeCompare(b.name));
  
  // Create table data for players
  const tableData = [];
  
  // Process each player's data for the table
  sortedPlayers.forEach(player => {
    // Get max hits for player
    const maxHits = Math.max(...player.combinations.map(c => c.hits), 0);
    
    // Sort combinations by hits (highest first)
    const sortedCombos = [...player.combinations].sort((a, b) => b.hits - a.hits);
    
    // Create player row data
    const playerData = [
      player.name, 
      `${player.combinations.length} sequência(s)\nMáx. acertos: ${maxHits}`
    ];
    
    tableData.push(playerData);
    
    // Add combinations (limited by maxCombosPerPlayer)
    const combosToShow = sortedCombos.slice(0, options.maxCombosPerPlayer);
    
    combosToShow.forEach(combo => {
      const numberCells = [];
      
      // Sort the numbers
      const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
      
      // Create a formatted string for the number sequence
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
      
      // Add the sequence row with indentation
      tableData.push(['', `${combo.hits} acertos:`, numbersText]);
    });
    
    // If there are more combinations than shown
    if (player.combinations.length > options.maxCombosPerPlayer) {
      tableData.push(['', `+ ${player.combinations.length - options.maxCombosPerPlayer} mais...`, '']);
    }
    
    // Add spacer row
    tableData.push(['', '', '']);
  });
  
  // Configure and create the table
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
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: PDF_CONFIG.margin, right: PDF_CONFIG.margin },
    didParseCell: function(data) {
      // Style numbers with 6 hits in green
      if (data.section === 'body' && data.column.index === 1 && data.cell.text.includes('6 acertos')) {
        data.cell.styles.textColor = [0, 150, 0];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Add visual marker for hit numbers in brackets
      if (data.section === 'body' && data.column.index === 2) {
        const text = data.cell.text.toString();
        if (text.includes('[')) {
          data.cell.styles.textColor = [0, 150, 0];
        }
      }
    }
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
    console.log('Starting PDF generation for game:', game.name);
    
    // Get all drawn numbers from the game
    const allDrawnNumbers = game.dailyDraws ? game.dailyDraws.flatMap(draw => draw.numbers) : [];
    
    // Initialize PDF
    const pdf = await createPDF();
    
    // Add header
    addHeader(pdf, game.name, new Date(), { color: options.themeColor });
    
    // Track current Y position
    let currentY = PDF_CONFIG.margin + 30;
    
    // Add near winners section if requested and available
    if (options.includeNearWinners) {
      currentY = addNearWinnersSection(pdf, game, allDrawnNumbers, { color: options.themeColor });
    }
    
    // Add winners section
    currentY = addWinnersSection(pdf, game, allDrawnNumbers, currentY, { color: options.themeColor });
    
    // Check if we need a new page before the players section
    if (currentY > PDF_CONFIG.pageHeight - 100) {
      pdf.addPage();
      currentY = PDF_CONFIG.margin;
    }
    
    // Add players section
    addPlayersSection(pdf, game, allDrawnNumbers, currentY, { 
      color: options.themeColor,
      maxCombosPerPlayer: 3
    });
    
    // Generate filename with game name
    const sanitizedGameName = game.name.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const filename = `resultado-${sanitizedGameName}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    console.log('PDF generation completed successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
