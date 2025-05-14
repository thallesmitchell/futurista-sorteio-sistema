
import jsPDF from "jspdf";
import { addSectionHeader, addSubtitle } from "../utils/pdf-table-utils";
import { PdfSectionOptions } from "../../types";

/**
 * Adds the header for the near winners section
 */
export const addNearWinnersSectionHeader = (
  doc: jsPDF,
  options: PdfSectionOptions = { color: '#39FF14' }
): number => {
  // Add section header
  const startY = 20; // Default starting position
  let y = addSectionHeader(doc, "Jogadores Próximos de Ganhar", startY);
  
  // Return the position after the header
  return y;
};

