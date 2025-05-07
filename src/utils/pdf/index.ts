
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
  
  // Extract winners if any
  const winners = game.winners || [];
  const winnerIds = winners.map(w => w.id);
  
  // Create report container with the required styling
  const reportElement = createReportContainer();
  
  // Add header
  addHeaderToReport(reportElement, reportTitle, formattedDateForDisplay);
  
  // Add winners banner if there are winners
  if (winners.length > 0) {
    addWinnersBanner(reportElement, winners, allDrawnNumbers, options.themeColor || '#25C17E');
  }
  
  // Add players in masonry layout
  const regularPlayers = [...game.players]
    .filter(p => !winnerIds.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  addPlayersToReport(reportElement, regularPlayers, allDrawnNumbers, options.themeColor || '#25C17E');
  
  // Generate PDF with specific options
  const pdfOptions = {
    margin: 0, // Remove margins completely
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.85 }, // Reduced quality for better compression
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true, // Enable compression
      background: '#0F111A' // Set background color for the PDF
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  return html2pdf().from(reportElement).set(pdfOptions).save();
};

// Re-export components if needed elsewhere
export * from './components/container';
export * from './components/number-ball';
export * from './components/players-list';
export * from './components/winners-banner';
export * from './types';
