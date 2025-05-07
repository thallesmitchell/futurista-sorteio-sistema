
import html2pdf from 'html2pdf.js';
import { Game } from '@/contexts/game/types';
import { GeneratePdfOptions } from './types';
import { createReportContainer, addHeaderToReport } from './components/container';
import { addWinnersBanner } from './components/winners-banner';
import { addPlayersToReport } from './components/players-list';

/**
 * Generates a PDF report for a game
 * @param game The game data to generate a report for
 * @param options Options for the PDF generation
 * @returns A promise that resolves when the PDF is generated
 */
export const generateGameReport = async (game: Game, options: GeneratePdfOptions = {}): Promise<void> => {
  console.log('Generating PDF report for game:', game.name);
  console.log('Game data:', {
    players: game.players.length,
    dailyDraws: game.dailyDraws.length,
    winners: game.winners?.length || 0,
  });
  
  // Get current date for the report
  const currentDate = new Date();
  const reportTitle = "Resultado";
  
  // Format date as in the example (06/maio/2025)
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", 
                  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const formattedDateForDisplay = `${day}/${month}/${year}`;
  
  // Get all drawn numbers
  const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
  console.log('All drawn numbers:', allDrawnNumbers);
  
  // Extract winners if any
  const winners = game.winners || [];
  const winnerIds = winners.map(w => w.id);
  console.log('Winners:', winners.length);
  
  // Create report container with the required styling
  const reportElement = createReportContainer();
  
  // Add header
  addHeaderToReport(reportElement, reportTitle, formattedDateForDisplay);
  
  // Add winners banner at the top, before the player list
  if (winners.length > 0) {
    console.log('Adding winners banner to PDF');
    addWinnersBanner(reportElement, winners, allDrawnNumbers, options.themeColor || '#25C17E');
  }
  
  // Add players in masonry layout
  console.log('Adding players to PDF, total players:', game.players.length);
  
  // Sort all players (including winners) by name
  const sortedPlayers = [...game.players].sort((a, b) => a.name.localeCompare(b.name));
  
  addPlayersToReport(reportElement, sortedPlayers, allDrawnNumbers, options.themeColor || '#25C17E');
  
  // Check if the reportElement has content before generating
  if (!reportElement.innerHTML || reportElement.innerHTML.trim() === '') {
    console.error('PDF report element is empty!');
    throw new Error('Failed to generate report: report container is empty');
  }
  
  console.log('Report element HTML length:', reportElement.innerHTML.length);
  
  // Append report to the document for debugging (will be removed before generating PDF)
  document.body.appendChild(reportElement);
  
  // Generate PDF with specific options
  const pdfOptions = {
    margin: 0, // Remove margins completely
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.85 }, // Reduced quality for better compression
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#020817' // Updated background color
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true, // Enable compression
      background: '#020817' // Updated background color
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  console.log('Starting PDF generation with options:', pdfOptions);
  
  try {
    // Generate PDF
    const result = await html2pdf().from(reportElement).set(pdfOptions).save();
    
    // Remove the element from DOM after generation
    document.body.removeChild(reportElement);
    
    console.log('PDF generated successfully');
    return result;
  } catch (error) {
    // Remove the element from DOM on error
    if (document.body.contains(reportElement)) {
      document.body.removeChild(reportElement);
    }
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Re-export components if needed elsewhere
export * from './components/container';
export * from './components/number-ball';
export * from './components/players-list';
export * from './components/winners-banner';
export * from './types';
