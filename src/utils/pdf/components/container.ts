
/**
 * Creates the main container for the PDF report
 */
export const createReportContainer = (): HTMLElement => {
  const reportElement = document.createElement('div');
  reportElement.className = 'pdf-content';
  reportElement.style.fontFamily = 'Montserrat, sans-serif'; // Using Montserrat font
  reportElement.style.padding = '20px';
  reportElement.style.margin = '0';
  reportElement.style.backgroundColor = '#0F111A';
  reportElement.style.color = '#FFFFFF';
  reportElement.style.maxWidth = '100%';
  reportElement.style.minHeight = '100vh'; // Ensure dark background covers full page
  
  // Add stylesheet for Montserrat font
  const montserratStyle = document.createElement('style');
  montserratStyle.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
    * { font-family: 'Montserrat', sans-serif; }
  `;
  reportElement.appendChild(montserratStyle);
  
  return reportElement;
};

/**
 * Adds the header section to the PDF report
 */
export const addHeaderToReport = (container: HTMLElement, title: string, date: string): void => {
  const header = document.createElement('div');
  header.className = 'pdf-header';
  header.style.textAlign = 'center';
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '20px';
  
  const titleElement = document.createElement('div');
  titleElement.style.fontSize = '24px';
  titleElement.innerHTML = `${title}<br/>${date}`;
  
  header.appendChild(titleElement);
  container.appendChild(header);
};
