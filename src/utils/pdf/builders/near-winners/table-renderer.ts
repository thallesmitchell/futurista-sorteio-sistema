
import jsPDF from "jspdf";
import { drawTable } from "../utils/pdf-table-utils";

/**
 * Renders the table of near winners
 */
export const renderNearWinnersTable = async (
  doc: jsPDF,
  data: [string, string, string][],
  startY: number
): Promise<number> => {
  // Define columns
  const columns = [
    { header: 'Jogador', dataKey: 'player' },
    { header: 'Números', dataKey: 'numbers' },
    { header: 'Acertos', dataKey: 'hits' }
  ];
  
  // Calculate column widths based on content
  const tableWidth = doc.internal.pageSize.getWidth() - 28; // 14px margin on each side
  const columnWidths = {
    player: Math.round(tableWidth * 0.35), // 35%
    numbers: Math.round(tableWidth * 0.50), // 50%
    hits: Math.round(tableWidth * 0.15)     // 15%
  };
  
  // Draw the table
  const finalY = drawTable(
    doc,
    columns,
    data,
    startY,
    {
      columnStyles: {
        0: { cellWidth: columnWidths.player },
        1: { cellWidth: columnWidths.numbers },
        2: { cellWidth: columnWidths.hits, halign: 'center' }
      },
      bodyStyles: {
        valign: 'middle'
      }
    }
  );
  
  return finalY;
};
