
import jsPDF from "jspdf";
import { addSectionHeader, addSubtitle } from "../utils/pdf-table-utils";

/**
 * Renders the header for the near winners section
 */
export const renderNearWinnersSectionHeader = (
  doc: jsPDF,
  totalNearWinners: number,
  startY: number = 20
): number => {
  // Add section header
  let y = addSectionHeader(doc, "Jogadores Próximos de Ganhar", startY);
  
  // Add subtitle with count
  y = addSubtitle(
    doc, 
    `Total de combinações com 5 acertos: ${totalNearWinners}`,
    y
  );
  
  return y;
};
