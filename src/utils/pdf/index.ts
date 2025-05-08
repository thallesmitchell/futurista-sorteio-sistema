
/**
 * PDF Generation Module
 * 
 * Provides functions to generate game reports as PDFs
 */

// Export the standard PDF generator
export { generateGameReport } from './pdfBuilder';

// Export the simplified PDF generator - primary method for general use
export { generateSimplePdf } from './simplePdfGenerator';

// Export PDF configuration
export { PDF_CONFIG, createPDF } from './builders/base-pdf';

// Export utility functions for direct use if needed
export { safeGetDrawnNumbers } from './builders/players-section';
export { addNearWinnersSection } from './builders/near-winners';
export { addWinnersSection } from './builders/winners-section';
export { addPlayersListSection } from './builders/players-section';
export { addDrawsSection, getLastDrawDate } from './builders/draws-section';

// Re-export types
export * from './types';
