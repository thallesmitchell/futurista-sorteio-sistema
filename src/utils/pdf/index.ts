
/**
 * PDF Generation Module
 * 
 * Provides functions to generate game reports as PDFs
 */

// Export our standard PDF generation function
export { generateGameReport } from './pdfBuilder';

// Re-export types
export * from './types';

// Export PDF configuration
export { PDF_CONFIG } from './builders/base-pdf';
