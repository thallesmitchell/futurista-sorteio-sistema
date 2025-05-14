
import jsPDF from "jspdf";
import { Game } from "@/contexts/game/types";
import { getNearWinnersData } from "./near-winners/data-helpers";
import { renderNearWinnersSectionHeader } from "./near-winners/section-header";
import { renderNearWinnersTable } from "./near-winners/table-renderer";
import { addSectionHeader, addSubtitle } from "./utils/pdf-table-utils";
import { PdfSectionOptions } from "../types";

/**
 * Builds the near winners section of the PDF
 */
export const buildNearWinnersSection = async (
  doc: jsPDF,
  game: Game,
  options: PdfSectionOptions = {}
): Promise<number> => {
  const { startY = 20, title = "Jogadores Próximos de Ganhar" } = options;
  
  // Start position
  let currentY = startY;
  
  // Add section header
  currentY = addSectionHeader(doc, title, currentY);
  
  // Get current page height
  const pageHeight = doc.internal.pageSize.height;
  
  // Check if we need to add a new page
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 20;
    // Re-add title on new page
    currentY = addSectionHeader(doc, title, currentY);
  }
  
  try {
    // Get near winners data
    const nearWinnersData = getNearWinnersData(game);
    
    // Display number of combinations close to winning
    currentY = addSubtitle(
      doc,
      `Total de combinações com 5 acertos: ${nearWinnersData.length}`,
      currentY
    );
    
    if (nearWinnersData.length === 0) {
      currentY += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Nenhum jogador próximo de ganhar.", 14, currentY);
      return currentY + 10;
    }
    
    // Render near winners table
    const tableData = nearWinnersData.map(nw => [
      nw.playerName,
      nw.numbers.join(", "),
      nw.hits.toString()
    ]) as [string, string, string][];
    
    currentY = await renderNearWinnersTable(doc, tableData, currentY + 5);
    
    return currentY;
  } catch (error) {
    console.error("Error building near winners section:", error);
    
    // Add error message to PDF
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0);
    doc.text(
      `Erro ao gerar seção de jogadores próximos: ${error.message}`,
      14,
      currentY + 10
    );
    
    return currentY + 20;
  }
};

// Export the function with the name that's expected in pdfBuilder.ts
export const addNearWinnersSection = buildNearWinnersSection;

// Export the default function
export default buildNearWinnersSection;
