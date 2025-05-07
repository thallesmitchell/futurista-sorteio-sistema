
import html2pdf from 'html2pdf.js';
import { Game } from '@/contexts/game/types';
import { GeneratePdfOptions } from './types';
import { createReportContainer, addHeaderToReport } from './components/container';
import { addWinnersBanner } from './components/winners-banner';
import { addPlayersToReport } from './components/players-list';
import { addNearWinnersSection } from './components/near-winners';

/**
 * Generates a PDF report for a game using HTML elements
 * This version uses the DOM to build the PDF structure before converting to PDF
 * 
 * @param game The game data to generate a report for
 * @param options Options for the PDF generation
 * @returns A promise that resolves when the PDF is generated
 */
export const generateHtmlGameReport = async (game: Game, options: GeneratePdfOptions = {}): Promise<void> => {
  console.log('Generating PDF report for game:', game.name);
  
  try {
    // Get current date for the report
    const currentDate = new Date();
    const reportTitle = "Resultado";
    
    // Format date for display
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", 
                    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDateForDisplay = `${day} de ${month} de ${year}`;
    
    // Get all drawn numbers from all draws
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Extract winners if any
    const winners = game.winners || [];
    const hasWinners = winners.length > 0;
    
    // Create main container for the report
    const reportElement = createReportContainer();
    
    // Add header
    addHeaderToReport(reportElement, reportTitle, formattedDateForDisplay);
    
    // If there are winners, add winners banner first
    if (hasWinners) {
      console.log('Adding winners banner to PDF');
      addWinnersBanner(
        reportElement, 
        winners.map(w => {
          const player = game.players.find(p => p.id === w.id);
          return player;
        }).filter(Boolean), 
        allDrawnNumbers,
        options.themeColor || '#39FF14'
      );
    } 
    // If no winners, add near winners section (Jogos Amarrados)
    else if (options.includeNearWinners !== false) {
      console.log('Adding near winners section to PDF');
      addNearWinnersSection(
        reportElement,
        game.players,
        allDrawnNumbers,
        options.themeColor || '#39FF14'
      );
    }
    
    // Add all players to the report
    console.log('Adding players to PDF, total players:', game.players.length);
    addPlayersToReport(
      reportElement,
      game.players,
      allDrawnNumbers,
      options.themeColor || '#39FF14'
    );
    
    // Append report to the document for html2pdf conversion
    document.body.appendChild(reportElement);
    
    // Generate PDF with specific options
    const pdfOptions = {
      margin: 10, // Small margin for better readability
      filename: options.filename || `resultado-${game.name.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.85 }, // Reduced quality for better compression
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#020817'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        background: '#020817'
      },
      // Improved page break handling
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    console.log('Starting PDF generation with options:', pdfOptions);
    
    try {
      // Generate PDF
      await html2pdf().from(reportElement).set(pdfOptions).save();
      
      // Remove the element from DOM after generation
      document.body.removeChild(reportElement);
      
      console.log('PDF generated successfully');
    } catch (error) {
      // Remove the element from DOM on error
      if (document.body.contains(reportElement)) {
        document.body.removeChild(reportElement);
      }
      console.error('Error generating PDF:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fatal error in PDF generation:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
