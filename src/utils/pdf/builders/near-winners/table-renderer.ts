
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
    
    // Definir larguras exatas das colunas - IMPORTANTE para manter alinhamento
    const columnWidths = {
      0: { cellWidth: 80 },  // Coluna do jogador
      1: { cellWidth: 90 } // Coluna da sequência - usando número em vez de 'auto'
    };
    
    // Process the table data to replace the content with empty strings
    // We'll manually render the content in didDrawCell
    const processedTableData = tableData.map(([playerName, sequence]) => {
      // Keep the player name intact, but set an empty string for the sequence
      return [playerName, ""] as [string, string];
    });
    
    // Definir margens e largura total da tabela para garantir consistência
    const tableWidth = pdf.internal.pageSize.width - 40; // 20px de margem em cada lado
    const marginLeft = 20;
    
    // CABEÇALHO: Criar uma tabela apenas para o cabeçalho
    autoTable(pdf, {
      startY: currentY,
      margin: { left: marginLeft },
      tableWidth: tableWidth,
     // head: [['Jogador', 'Sequência (5 acertos)']],
      head: [['Jogadores na risca da prêmio!']],
      body: [], // Sem corpo de tabela aqui
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
        halign: 'center',
        fontSize: 12,
      },
      columnStyles: columnWidths // Usar as mesmas larguras de coluna
    });
    
    // Obter a posição Y após a primeira tabela (apenas cabeçalho)
    const headerEndY = (pdf as any).lastAutoTable.finalY;
    
    // CORPO: Agora renderizamos o corpo da tabela separadamente
    autoTable(pdf, {
      startY: headerEndY,
      margin: { left: marginLeft }, // Mesma margem esquerda para alinhamento
      tableWidth: tableWidth, // Mesma largura total
      head: [], // Sem cabeçalho aqui
      body: processedTableData,
      theme: 'striped',
      styles: {
        cellPadding: 5,
        fontSize: 11,
        halign: 'center',
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      columnStyles: columnWidths, // Usar as mesmas larguras de coluna
      didDrawPage: function(data) {
        console.log('Page redrawn in table body');
      },
      didDrawCell: function(data) {
        // Agora só lidamos com células do corpo, não há cabeçalho para interferir
        if (data.column.index === 1) {
          const rowIndex = data.row.index;
          if (rowIndex < tableData.length) {
            const originalSequence = tableData[rowIndex][1];
            
            // Skip if no sequence
            if (!originalSequence) {
              return;
            }
            
            // Save the current graphics state
            pdf.saveGraphicsState();
            
            // Default cell position for text
            const xPos = data.cell.x + 5; // Initial offset from cell border
            const yPos = data.cell.y + data.cell.height / 2 + 1; // Vertically centered
            
            // Check if we need to handle highlighting (has asterisks)
            if (originalSequence.includes('*')) {
              console.log(`Rendering cell with highlighting: ${originalSequence}`);
              
              // Split the text into parts (numbers separated by spaces)
              const parts = originalSequence.split(' ');
              
              let currentX = xPos;
              
              // Draw each part of the string with appropriate highlighting
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
                pdf.text(numberText, currentX, yPos);
                
                // Move X position for next part (add space + text width)
                const textWidth = pdf.getTextWidth(numberText);
                currentX += textWidth + 3;
              }
            } else {
              // No highlighting needed, render the text normally
              pdf.setTextColor(0, 0, 0);
              pdf.setFont('helvetica', 'normal');
              pdf.text(originalSequence, xPos, yPos);
            }
            
            // Always restore graphics state
            pdf.restoreGraphicsState();
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
