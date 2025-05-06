
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Game } from '@/contexts/GameContext';
import html2pdf from 'html2pdf.js';

interface GameReportProps {
  game: Game;
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const GameReport: React.FC<GameReportProps> = ({ 
  game, 
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const { toast } = useToast();
  
  const generateReport = () => {
    // Get current date for the report
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
    const reportTitle = game.winners && game.winners.length > 0 ? "Resultado final" : "Parcial do dia";
    
    // Create report container
    const reportElement = document.createElement('div');
    reportElement.style.fontFamily = 'monospace';
    reportElement.style.padding = '20px';
    reportElement.style.margin = '0';
    reportElement.style.backgroundColor = '#ffffff';
    reportElement.style.maxWidth = '800px';
    
    // Header with logo and title
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '30px';
    
    // Left logo
    const leftLogo = document.createElement('img');
    leftLogo.src = '/lovable-uploads/b7f54603-ff4e-4280-8c96-a36a94acf7c6.png';
    leftLogo.style.height = '80px';
    header.appendChild(leftLogo);
    
    // Title
    const title = document.createElement('div');
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '24px';
    title.style.fontFamily = 'monospace';
    title.style.color = '#000000'; // Ensuring title is visible with good contrast
    
    // Format date as in the example (06/maio/2025)
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDateForDisplay = `${day}/${month}/${year}`;
    
    title.innerHTML = `${reportTitle}<br/>${formattedDateForDisplay}`;
    header.appendChild(title);
    
    // Right logo
    const rightLogo = document.createElement('img');
    rightLogo.src = '/lovable-uploads/b7f54603-ff4e-4280-8c96-a36a94acf7c6.png';
    rightLogo.style.height = '80px';
    header.appendChild(rightLogo);
    
    reportElement.appendChild(header);
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Extract winners if any
    const winners = game.winners || [];
    const winnerIds = winners.map(w => w.id);
    
    // If there are winners, show them at the top
    if (winners.length > 0) {
      const winnersSection = document.createElement('div');
      winnersSection.style.marginBottom = '30px';
      
      const winnersTitle = document.createElement('div');
      winnersTitle.style.backgroundColor = '#004d25';
      winnersTitle.style.color = '#ffffff';
      winnersTitle.style.padding = '10px 15px';
      winnersTitle.style.fontWeight = 'bold';
      winnersTitle.style.textAlign = 'center';
      winnersTitle.style.fontSize = '18px';
      winnersTitle.style.fontFamily = 'monospace';
      winnersTitle.style.marginBottom = '15px';
      winnersTitle.innerHTML = 'GANHADORES <span style="margin-left: 8px;">🏆</span>';
      
      winnersSection.appendChild(winnersTitle);
      
      winners.forEach(winner => {
        const winnerBox = createPlayerBox(winner, allDrawnNumbers, true);
        winnerBox.style.width = '100%';
        winnerBox.style.marginBottom = '15px';
        winnersSection.appendChild(winnerBox);
      });
      
      reportElement.appendChild(winnersSection);
    }
    
    // Sort players alphabetically
    const sortedPlayers = [...game.players].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    // Add regular players (excluding winners)
    const regularPlayers = sortedPlayers.filter(p => !winnerIds.includes(p.id));
    
    // Create two-column layout for regular players
    const playersContainer = document.createElement('div');
    playersContainer.style.display = 'flex';
    playersContainer.style.flexWrap = 'wrap';
    playersContainer.style.gap = '15px';
    playersContainer.style.justifyContent = 'space-between';
    
    // Create left column
    const leftColumn = document.createElement('div');
    leftColumn.style.flex = '0 0 calc(50% - 8px)';
    leftColumn.style.display = 'flex';
    leftColumn.style.flexDirection = 'column';
    leftColumn.style.gap = '15px';
    
    // Create right column
    const rightColumn = document.createElement('div');
    rightColumn.style.flex = '0 0 calc(50% - 8px)';
    rightColumn.style.display = 'flex';
    rightColumn.style.flexDirection = 'column';
    rightColumn.style.gap = '15px';
    
    // Distribute players between columns
    regularPlayers.forEach((player, index) => {
      const playerBox = createPlayerBox(player, allDrawnNumbers, false);
      playerBox.style.marginBottom = '0'; // Remove bottom margin as we're using gap
      
      // Alternate between left and right columns
      if (index % 2 === 0) {
        leftColumn.appendChild(playerBox);
      } else {
        rightColumn.appendChild(playerBox);
      }
    });
    
    playersContainer.appendChild(leftColumn);
    playersContainer.appendChild(rightColumn);
    reportElement.appendChild(playersContainer);
    
    // Function to create player box
    function createPlayerBox(player, allDrawnNumbers, isWinner) {
      const playerBox = document.createElement('div');
      playerBox.style.backgroundColor = '#e9f5e9';
      playerBox.style.borderRadius = '8px';
      playerBox.style.overflow = 'hidden';
      playerBox.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      playerBox.style.breakInside = 'avoid'; // Prevent box from breaking across pages
      
      // Player name header
      const nameHeader = document.createElement('div');
      nameHeader.style.backgroundColor = '#004d25';
      nameHeader.style.color = '#ffffff';
      nameHeader.style.padding = '8px 15px';
      nameHeader.style.fontWeight = 'bold';
      nameHeader.style.textAlign = 'center';
      nameHeader.style.fontFamily = 'monospace';
      nameHeader.style.fontSize = '16px';
      nameHeader.style.display = 'flex';
      nameHeader.style.justifyContent = 'center';
      nameHeader.style.alignItems = 'center';
      
      // Add player name
      const playerName = document.createElement('span');
      playerName.textContent = player.name;
      nameHeader.appendChild(playerName);
      
      // Add trophy icon if winner
      if (isWinner) {
        const trophyIcon = document.createElement('span');
        trophyIcon.textContent = ' 🏆';
        trophyIcon.style.fontSize = '18px';
        trophyIcon.style.marginLeft = '8px';
        nameHeader.appendChild(trophyIcon);
        
        // Add winner highlight styles
        playerBox.style.border = '2px solid #1db954';
        nameHeader.style.backgroundColor = '#1db954';
      }
      
      playerBox.appendChild(nameHeader);
      
      // Player combinations
      const combinationsContainer = document.createElement('div');
      combinationsContainer.style.padding = '15px';
      
      if (player.combinations && player.combinations.length > 0) {
        player.combinations.forEach((combo, comboIndex) => {
          // Check if this combination has 6 hits
          const hasWinningCombo = combo.hits === 6;
          
          const comboRow = document.createElement('div');
          comboRow.style.display = 'flex';
          comboRow.style.flexWrap = 'wrap';
          comboRow.style.justifyContent = 'center';
          comboRow.style.gap = '10px';
          comboRow.style.marginBottom = '12px';
          comboRow.style.fontFamily = 'monospace';
          
          // If winning combination, add highlight
          if (hasWinningCombo) {
            comboRow.style.backgroundColor = 'rgba(29, 185, 84, 0.15)';
            comboRow.style.padding = '8px';
            comboRow.style.borderRadius = '6px';
          }
          
          // Create numbered balls
          combo.numbers.sort((a, b) => a - b).forEach(number => {
            const isHit = allDrawnNumbers.includes(number);
            
            const ball = document.createElement('span');
            ball.style.width = '28px';
            ball.style.height = '28px';
            ball.style.borderRadius = '4px';
            ball.style.display = 'inline-flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontWeight = 'bold';
            ball.style.fontSize = '14px';
            ball.style.fontFamily = 'monospace';
            
            // Format the number with leading zero
            const formattedNumber = String(number).padStart(2, '0');
            
            if (isHit) {
              // Highlighted ball for hits
              ball.style.backgroundColor = '#1db954';
              ball.style.color = '#ffffff';
            } else {
              // Regular ball
              ball.style.backgroundColor = 'transparent';
              ball.style.color = '#333333';
              ball.style.border = '1px solid #333333';
            }
            
            ball.textContent = formattedNumber;
            comboRow.appendChild(ball);
          });
          
          combinationsContainer.appendChild(comboRow);
          
          // Add separator between combinations (except for the last one)
          if (comboIndex < player.combinations.length - 1) {
            const separator = document.createElement('hr');
            separator.style.margin = '10px 0';
            separator.style.border = '0';
            separator.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
            combinationsContainer.appendChild(separator);
          }
        });
      } else {
        const noCombo = document.createElement('p');
        noCombo.textContent = 'Sem combinações';
        noCombo.style.textAlign = 'center';
        combinationsContainer.appendChild(noCombo);
      }
      
      playerBox.appendChild(combinationsContainer);
      
      return playerBox;
    }
    
    // Generate PDF
    const options = {
      margin: [15, 15],
      filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}-${formattedDate.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(reportElement).set(options).save()
      .then(() => {
        toast({
          title: "Relatório gerado com sucesso",
          description: "O PDF foi baixado para o seu dispositivo",
        });
      })
      .catch(error => {
        console.error("Erro ao gerar PDF:", error);
        toast({
          title: "Erro ao gerar relatório",
          description: "Ocorreu um problema ao gerar o PDF",
          variant: "destructive"
        });
      });
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={generateReport}
      className={className}
    >
      <FileText className="mr-1 h-4 w-4" />
      Baixar Relatório
    </Button>
  );
};
