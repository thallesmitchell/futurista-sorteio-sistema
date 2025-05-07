
/**
 * Creates the main container for the PDF report
 */
export const createReportContainer = (): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'pdf-content';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.maxWidth = '100%';
  container.style.margin = '0 auto';
  container.style.padding = '20px';
  container.style.backgroundColor = '#fff';
  container.style.color = '#000';
  
  return container;
};

/**
 * Adds a header to the PDF report
 */
export const addHeaderToReport = (
  container: HTMLElement,
  title: string,
  date: string
): void => {
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '20px';
  
  const titleElem = document.createElement('h1');
  titleElem.textContent = title;
  titleElem.style.margin = '0 0 10px 0';
  titleElem.style.fontSize = '24px';
  
  const dateElem = document.createElement('p');
  dateElem.textContent = date;
  dateElem.style.margin = '0';
  dateElem.style.fontSize = '16px';
  
  header.appendChild(titleElem);
  header.appendChild(dateElem);
  container.appendChild(header);
};
