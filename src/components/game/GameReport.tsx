
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
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
    reportElement.style.backgroundColor = '#ffffff';
    
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
    title.innerHTML = `${reportTitle}<br/>${formattedDate.replace(/\//g, '/')}`;
    title.style.fontFamily = 'monospace';
    header.appendChild(title);
    
    // Right logo
    const rightLogo = document.createElement('img');
    rightLogo.src = '/lovable-uploads/b7f54603-ff4e-4280-8c96-a36a94acf7c6.png';
    rightLogo.style.height = '80px';
    header.appendChild(rightLogo);
    
    reportElement.appendChild(header);
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Create player boxes container with two columns
    const playersContainer = document.createElement('div');
    playersContainer.style.display = 'flex';
    playersContainer.style.flexWrap = 'wrap';
    playersContainer.style.justifyContent = 'space-between';
    playersContainer.style.gap = '15px';
    
    // Sort players alphabetically
    const sortedPlayers = [...game.players].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    // Extract winners if any
    const winners = game.winners || [];
    const winnerIds = winners.map(w => w.id);
    
    // If there are winners, show them at the top
    if (winners.length > 0) {
      winners.forEach(winner => {
        const winnerBox = createPlayerBox(winner, allDrawnNumbers, true);
        // Winner box takes full width
        winnerBox.style.width = '100%';
        winnerBox.style.marginBottom = '20px';
        reportElement.appendChild(winnerBox);
      });
    }
    
    // Add regular players (excluding winners)
    const regularPlayers = sortedPlayers.filter(p => !winnerIds.includes(p.id));
    
    // Create left column
    const leftColumn = document.createElement('div');
    leftColumn.style.flex = '1';
    leftColumn.style.minWidth = '45%';
    leftColumn.style.display = 'flex';
    leftColumn.style.flexDirection = 'column';
    leftColumn.style.gap = '15px';
    
    // Create right column
    const rightColumn = document.createElement('div');
    rightColumn.style.flex = '1';
    rightColumn.style.minWidth = '45%';
    rightColumn.style.display = 'flex';
    rightColumn.style.flexDirection = 'column';
    rightColumn.style.gap = '15px';
    
    // Distribute players between columns
    regularPlayers.forEach((player, index) => {
      const playerBox = createPlayerBox(player, allDrawnNumbers, false);
      
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
      playerBox.style.backgroundColor = isWinner ? '#1db954' : '#e9f5e9';
      playerBox.style.borderRadius = '10px';
      playerBox.style.overflow = 'hidden';
      playerBox.style.marginBottom = '15px';
      playerBox.style.breakInside = 'avoid'; // Prevent box from breaking across pages
      
      // Player name header
      const nameHeader = document.createElement('div');
      nameHeader.style.backgroundColor = '#0e4429';
      nameHeader.style.color = '#ffffff';
      nameHeader.style.padding = '8px 15px';
      nameHeader.style.fontWeight = 'bold';
      nameHeader.style.textAlign = 'center';
      nameHeader.style.fontFamily = 'monospace';
      
      if (isWinner) {
        nameHeader.textContent = `VENCEDOR — ${player.name}`;
      } else {
        nameHeader.textContent = player.name;
      }
      
      playerBox.appendChild(nameHeader);
      
      // Player combinations
      const combinationsContainer = document.createElement('div');
      combinationsContainer.style.padding = '15px';
      
      if (player.combinations && player.combinations.length > 0) {
        player.combinations.forEach(combo => {
          const comboRow = document.createElement('div');
          comboRow.style.display = 'flex';
          comboRow.style.marginBottom = '8px';
          comboRow.style.fontFamily = 'monospace';
          
          // Create numbered balls
          combo.numbers.forEach(number => {
            const isHit = allDrawnNumbers.includes(number);
            
            const ball = document.createElement('div');
            ball.style.width = '30px';
            ball.style.height = '30px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'inline-flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.margin = '0 5px';
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
              ball.style.color = '#000000';
            }
            
            ball.textContent = formattedNumber;
            comboRow.appendChild(ball);
          });
          
          combinationsContainer.appendChild(comboRow);
        });
      } else {
        const noCombo = document.createElement('p');
        noCombo.textContent = 'Sem combinações';
        noCombo.style.textAlign = 'center';
        combinationsContainer.appendChild(noCombo);
      }
      
      playerBox.appendChild(combinationsContainer);
      
      // Add trophy icons if winner
      if (isWinner) {
        const trophyLeft = document.createElement('div');
        trophyLeft.innerHTML = `
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1" fill="none">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 22v-6.3a.7.7 0 0 1 .7-.7h2.6a.7.7 0 0 1 .7.7V22"></path>
            <path d="M7 10v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-4"></path>
            <path d="M18 4c-.5-2-2.5-3-5.5-3h-1C8.5 1 6.5 2 6 4"></path>
            <path d="M18 10V4"></path>
            <path d="M6 10V4"></path>
          </svg>
        `;
        trophyLeft.style.position = 'absolute';
        trophyLeft.style.left = '20px';
        trophyLeft.style.top = '50%';
        trophyLeft.style.transform = 'translateY(-50%)';
        trophyLeft.style.color = '#0e4429';
        
        const trophyRight = document.createElement('div');
        trophyRight.innerHTML = `
          <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1" fill="none">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 22v-6.3a.7.7 0 0 1 .7-.7h2.6a.7.7 0 0 1 .7.7V22"></path>
            <path d="M7 10v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-4"></path>
            <path d="M18 4c-.5-2-2.5-3-5.5-3h-1C8.5 1 6.5 2 6 4"></path>
            <path d="M18 10V4"></path>
            <path d="M6 10V4"></path>
          </svg>
        `;
        trophyRight.style.position = 'absolute';
        trophyRight.style.right = '20px';
        trophyRight.style.top = '50%';
        trophyRight.style.transform = 'translateY(-50%)';
        trophyRight.style.color = '#0e4429';
        
        playerBox.style.position = 'relative';
        playerBox.appendChild(trophyLeft);
        playerBox.appendChild(trophyRight);
      }
      
      return playerBox;
    }
    
    // Generate PDF with 9:16 aspect ratio
    const options = {
      margin: 10,
      filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}-${formattedDate.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [90, 160], orientation: 'portrait' } // 9:16 aspect ratio
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
