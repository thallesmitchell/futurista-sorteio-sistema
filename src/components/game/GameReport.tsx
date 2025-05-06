
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
    const reportDate = new Date().toLocaleDateString();
    
    // Create the report content
    const reportElement = document.createElement('div');
    reportElement.style.padding = '20px';
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.color = '#000';
    
    // Title
    const title = document.createElement('h1');
    title.textContent = `Parcial do dia ${reportDate}`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.fontSize = '24px';
    reportElement.appendChild(title);
    
    // Game info
    const gameInfo = document.createElement('div');
    gameInfo.style.marginBottom = '25px';
    gameInfo.style.textAlign = 'center';
    
    const gameName = document.createElement('h2');
    gameName.textContent = game.name;
    gameName.style.fontSize = '20px';
    gameName.style.marginBottom = '8px';
    gameInfo.appendChild(gameName);
    
    const gameDetails = document.createElement('div');
    gameDetails.innerHTML = `
      <p>Iniciado em ${new Date(game.startDate).toLocaleDateString()}</p>
      <p>Total de jogadores: ${game.players.length}</p>
      <p>Sorteios realizados: ${game.dailyDraws.length}</p>
    `;
    gameDetails.style.fontSize = '14px';
    gameDetails.style.color = '#555';
    gameInfo.appendChild(gameDetails);
    
    reportElement.appendChild(gameInfo);
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Players and their combinations
    if (game.players.length > 0) {
      const playersSection = document.createElement('div');
      
      game.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.style.padding = '16px';
        playerCard.style.marginBottom = '20px';
        playerCard.style.border = '1px solid #e2e8f0';
        playerCard.style.borderRadius = '8px';
        playerCard.style.backgroundColor = '#f8fafc';
        
        // Player name
        const playerName = document.createElement('h3');
        playerName.textContent = player.name;
        playerName.style.fontSize = '18px';
        playerName.style.marginBottom = '10px';
        playerCard.appendChild(playerName);
        
        // Combinations
        if (player.combinations && player.combinations.length > 0) {
          const combinationsContainer = document.createElement('div');
          
          player.combinations.forEach((combo, comboIdx) => {
            const comboDiv = document.createElement('div');
            comboDiv.style.marginBottom = '10px';
            
            // Combo header
            const comboHeader = document.createElement('div');
            comboHeader.textContent = `Combinação ${comboIdx + 1}:`;
            comboHeader.style.fontSize = '14px';
            comboHeader.style.marginBottom = '5px';
            comboDiv.appendChild(comboHeader);
            
            // Numbers display
            const numbersContainer = document.createElement('div');
            numbersContainer.style.display = 'flex';
            numbersContainer.style.flexWrap = 'wrap';
            numbersContainer.style.gap = '6px';
            
            const sortedNumbers = [...combo.numbers].sort((a, b) => a - b);
            
            sortedNumbers.forEach(number => {
              const isHit = allDrawnNumbers.includes(number);
              
              const numberBadge = document.createElement('div');
              numberBadge.textContent = number.toString();
              numberBadge.style.width = '32px';
              numberBadge.style.height = '32px';
              numberBadge.style.display = 'flex';
              numberBadge.style.alignItems = 'center';
              numberBadge.style.justifyContent = 'center';
              numberBadge.style.borderRadius = '50%';
              numberBadge.style.fontWeight = '600';
              numberBadge.style.fontSize = '14px';
              
              // Style based on hit status
              if (isHit) {
                numberBadge.style.backgroundColor = '#10b981'; // green
                numberBadge.style.color = '#ffffff';
              } else {
                numberBadge.style.backgroundColor = '#f1f5f9'; // light gray
                numberBadge.style.border = '1px solid #cbd5e1';
                numberBadge.style.color = '#334155';
              }
              
              numbersContainer.appendChild(numberBadge);
            });
            
            comboDiv.appendChild(numbersContainer);
            
            // Display hits count
            const hitsCount = document.createElement('div');
            hitsCount.textContent = `Acertos: ${combo.hits}`;
            hitsCount.style.fontSize = '14px';
            hitsCount.style.marginTop = '6px';
            hitsCount.style.color = combo.hits > 0 ? '#10b981' : '#64748b';
            hitsCount.style.fontWeight = combo.hits > 0 ? '600' : '400';
            comboDiv.appendChild(hitsCount);
            
            combinationsContainer.appendChild(comboDiv);
          });
          
          playerCard.appendChild(combinationsContainer);
        } else {
          const noCombo = document.createElement('p');
          noCombo.textContent = 'Sem combinações registradas';
          noCombo.style.color = '#64748b';
          noCombo.style.fontSize = '14px';
          playerCard.appendChild(noCombo);
        }
        
        playersSection.appendChild(playerCard);
      });
      
      reportElement.appendChild(playersSection);
    } else {
      const noPlayers = document.createElement('p');
      noPlayers.textContent = 'Nenhum jogador registrado';
      noPlayers.style.textAlign = 'center';
      noPlayers.style.color = '#64748b';
      noPlayers.style.padding = '30px 0';
      reportElement.appendChild(noPlayers);
    }
    
    // Daily draws
    if (game.dailyDraws && game.dailyDraws.length > 0) {
      const drawsSection = document.createElement('div');
      drawsSection.style.marginTop = '30px';
      
      const drawsTitle = document.createElement('h3');
      drawsTitle.textContent = 'Sorteios Realizados';
      drawsTitle.style.fontSize = '18px';
      drawsTitle.style.marginBottom = '15px';
      drawsTitle.style.textAlign = 'center';
      drawsSection.appendChild(drawsTitle);
      
      // Sort draws by date (most recent first)
      const sortedDraws = [...game.dailyDraws]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      sortedDraws.forEach(draw => {
        const drawCard = document.createElement('div');
        drawCard.style.padding = '12px';
        drawCard.style.marginBottom = '12px';
        drawCard.style.border = '1px solid #e2e8f0';
        drawCard.style.borderRadius = '8px';
        drawCard.style.backgroundColor = '#f8fafc';
        
        // Draw date
        const drawDate = document.createElement('div');
        drawDate.textContent = `Sorteio do dia ${new Date(draw.date).toLocaleDateString()}`;
        drawDate.style.fontSize = '16px';
        drawDate.style.marginBottom = '10px';
        drawDate.style.fontWeight = '500';
        drawCard.appendChild(drawDate);
        
        // Numbers display
        const numbersContainer = document.createElement('div');
        numbersContainer.style.display = 'flex';
        numbersContainer.style.flexWrap = 'wrap';
        numbersContainer.style.gap = '6px';
        
        const sortedNumbers = [...draw.numbers].sort((a, b) => a - b);
        
        sortedNumbers.forEach(number => {
          const numberBadge = document.createElement('div');
          numberBadge.textContent = number.toString();
          numberBadge.style.width = '32px';
          numberBadge.style.height = '32px';
          numberBadge.style.display = 'flex';
          numberBadge.style.alignItems = 'center';
          numberBadge.style.justifyContent = 'center';
          numberBadge.style.borderRadius = '50%';
          numberBadge.style.backgroundColor = '#7c3aed'; // purple
          numberBadge.style.color = '#ffffff';
          numberBadge.style.fontWeight = '600';
          numberBadge.style.fontSize = '14px';
          
          numbersContainer.appendChild(numberBadge);
        });
        
        drawCard.appendChild(numbersContainer);
        drawsSection.appendChild(drawCard);
      });
      
      reportElement.appendChild(drawsSection);
    }
    
    // Generate PDF with 9:16 aspect ratio
    const options = {
      margin: 10,
      filename: `parcial-${game.name.replace(/\s+/g, '-').toLowerCase()}-${reportDate.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: [90, 160], orientation: 'portrait' } // 9:16 aspect ratio
    };
    
    html2pdf().from(reportElement).set(options).save()
      .then(() => {
        toast({
          title: "Relatório gerado",
          description: "O PDF foi baixado com sucesso",
        });
      })
      .catch(error => {
        toast({
          title: "Erro ao gerar relatório",
          description: "Ocorreu um problema ao gerar o PDF",
          variant: "destructive"
        });
        console.error("PDF generation error:", error);
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
