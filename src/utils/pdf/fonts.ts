
import { jsPDF } from 'jspdf';

// Function to load font files
export const loadFonts = async (pdf: jsPDF): Promise<void> => {
  // Usamos as fontes padrão disponíveis no jsPDF em vez de tentar carregar fontes personalizadas
  console.log('Usando fontes padrão em vez de fontes Inter personalizadas');
  return Promise.resolve();
};

// Add standard fonts to the PDF document
export const addFonts = (pdf: jsPDF): void => {
  try {
    // Usa a fonte Helvetica padrão que vem embutida no PDF
    pdf.setFont('helvetica');
  } catch (error) {
    console.error('Erro ao definir fontes no PDF:', error);
  }
};
