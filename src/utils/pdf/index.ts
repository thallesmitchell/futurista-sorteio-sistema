
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

// Re-export types
export * from './types';
