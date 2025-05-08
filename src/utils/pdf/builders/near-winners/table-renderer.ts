
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_CONFIG } from '../base-pdf';

/**
 * Generate the table for near winners
 */
export const generateNearWinnersTable = (
  pdf: jsPDF,
  tableData: Array<[string, string]>,
  currentY: number
): number => {
  try {
    if (!tableData || tableData.length === 0) {
      console.log('No near winners data to display in table');
      return currentY;
    }
    
    console.log(`Rendering near winners table with ${tableData.length} rows`);
    
    // Log the table data for debugging
    tableData.forEach((row, index) => {
      console.log(`Table row ${index}:`, JSON.stringify(row));
    });
    
    // Configure the table
    autoTable(pdf, {
      startY: currentY,
      head: [['Jogador', 'Sequência (5 acertos)']],
      body: tableData,
      theme: 'striped',
      styles: {
        cellPadding: 5,
        fontSize: 11,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 'auto' }
      },
      didDrawCell: function(data) {
        // Apply highlighting for cells with specific content
        if (data.column.index === 1 && data.cell.text) {
          let cellText = String(data.cell.text);
          
          // Check if this cell has numbers to highlight
          if (cellText.includes('*')) {
            // Get the text content
            const parts = cellText.split(' ');
            
            // Process the text to highlight hits
            let xOffset = data.cell.x + 5; // Initial offset from cell border
            const yPos = data.cell.y + data.cell.height / 2 + 1;
            
            // Save the current text state
            pdf.saveGraphicsState();
            
            // Draw each part of the string
            for (const part of parts) {
              const isHit = part.includes('*');
              const numberText = part.replace(/\*/g, '');
              
              // Set text properties based on whether it's a hit
              if (isHit) {
                pdf.setTextColor(0, 158, 26); // Green for hits
                pdf.setFont('helvetica', 'bold');
              } else {
                pdf.setTextColor(0, 0, 0); // Black for non-hits
                pdf.setFont('helvetica', 'normal');
              }
              
              // Draw this part of the text
              pdf.text(numberText, xOffset, yPos);
              
              // Move xOffset for next part (space + average width of text)
              const textWidth = pdf.getTextWidth(numberText);
              xOffset += textWidth + 3;
            }
            
            // Restore the graphics state
            pdf.restoreGraphicsState();
            
            // Clear the cell's text content as we've manually drawn it
            data.cell.text = '';
          }
        }
      }
    });
    
    // Get final Y position and add more space after table
    const finalY = (pdf as any).lastAutoTable.finalY + 20;
    return finalY;
  } catch (error) {
    console.error("Error generating near winners table:", error);
    return currentY + 20; // Return a safe position in case of error
  }
};
