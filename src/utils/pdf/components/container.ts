
/**
 * Creates the main container for the PDF report
 */
export const createReportContainer = (): HTMLElement => {
  const reportElement = document.createElement('div');
  reportElement.className = 'pdf-content';
  reportElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"; // Ensure Inter font with fallbacks
  reportElement.style.padding = '20px';
  reportElement.style.margin = '0';
  reportElement.style.backgroundColor = '#0F111A';
  reportElement.style.color = '#FFFFFF';
  reportElement.style.maxWidth = '100%';
  reportElement.style.minHeight = '100vh'; // Ensure dark background covers full page
  
  return reportElement;
};

/**
 * Adds the header section to the PDF report
 */
export const addHeaderToReport = (container: HTMLElement, title: string, date: string): void => {
  const header = document.createElement('div');
  header.className = 'pdf-header';
  header.style.textAlign = 'center';
  header.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"; // Explicit font family
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '30px'; // Increased margin for better visibility
  header.style.padding = '10px';
  header.style.display = 'block'; // Ensure the header is displayed
  header.style.backgroundColor = '#1A1F2C'; // Distinct background to make header visible
  header.style.borderRadius = '8px';
  
  const titleElement = document.createElement('div');
  titleElement.style.fontSize = '24px';
  titleElement.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"; // Explicit font family
  titleElement.style.margin = '10px 0';
  titleElement.innerHTML = `${title}<br/>${date}`;
  
  header.appendChild(titleElement);
  container.appendChild(header);
};
