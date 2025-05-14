
// Export functions from the PDF utility modules
export { generateGameReport } from './pdfBuilder';
export { generateSimplePdf } from './simplePdfGenerator';

// Re-export types
export type { GeneratePdfOptions, PDFOptions } from './types';

/**
 * Main PDF generation function for compatibility with existing code
 * 
 * @param game Game data to generate PDF from
 * @param options PDF configuration options
 * @returns Promise for PDF generation
 */
export const generatePdf = async (game: any, options: {
  themeColor?: string;
  simpleMode?: boolean;
  hasWinners?: boolean;
  includeNearWinners?: boolean;
  includeWinners?: boolean;
  trophySvgData?: string;
} = {}) => {
  try {
    // Convert options to use newer format
    const newOptions: import('./types').GeneratePdfOptions = {
      themeColor: options.themeColor,
      includeNearWinners: options.includeNearWinners,
      hasWinners: options.hasWinners,
      trophySvgData: options.trophySvgData
    };
    
    // Choose PDF function based on mode
    if (options.simpleMode) {
      return generateSimplePdf(game, newOptions);
    } else {
      return generateGameReport(game, newOptions);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
};
