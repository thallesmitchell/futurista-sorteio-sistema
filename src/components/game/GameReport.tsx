
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Game } from '@/contexts/GameContext';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [profileData, setProfileData] = useState({
    themeColor: '#25C17E' // Default color
  });
  
  // Buscar perfil do administrador atual
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('theme_color, username')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfileData({
            themeColor: data.theme_color || '#25C17E'
          });
        }
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const generateReport = () => {
    // Get current date for the report
    const currentDate = new Date();
    const reportTitle = game.winners && game.winners.length > 0 ? "Resultado final" : "Parcial do dia";
    
    // Format date as in the example (06/maio/2025)
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDateForDisplay = `${day}/${month}/${year}`;
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Extract winners if any
    const winners = game.winners || [];
    const winnerIds = winners.map(w => w.id);
    
    // Create report container
    const reportElement = document.createElement('div');
    reportElement.className = 'pdf-content';
    reportElement.style.fontFamily = 'Orbitron, sans-serif';
    reportElement.style.padding = '20px';
    reportElement.style.margin = '0';
    reportElement.style.backgroundColor = '#0F111A';
    reportElement.style.color = '#FFFFFF';
    reportElement.style.maxWidth = '100%';
    
    // Header with title
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.style.textAlign = 'center';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '20px';
    
    const title = document.createElement('div');
    title.style.fontSize = '24px';
    title.innerHTML = `${reportTitle}<br/>${formattedDateForDisplay}`;
    
    header.appendChild(title);
    reportElement.appendChild(header);
    
    // If there are winners, show them at the top
    if (winners.length > 0) {
      winners.forEach(winner => {
        const winningCombos = winner.combinations.filter(combo => combo.hits === 6);
        
        winningCombos.forEach((winningCombo, index) => {
          const winnerBox = document.createElement('div');
          winnerBox.className = 'pdf-winner-box';
          winnerBox.style.backgroundColor = '#25C17E';
          winnerBox.style.borderRadius = '8px';
          winnerBox.style.marginBottom = '20px';
          winnerBox.style.overflow = 'hidden';
          winnerBox.style.pageBreakInside = 'avoid';
          winnerBox.style.breakInside = 'avoid';
          
          // Winner header
          const winnerHeader = document.createElement('div');
          winnerHeader.className = 'pdf-winner-header';
          winnerHeader.innerHTML = `🏆 VENCEDOR - ${winner.name} 🏆`;
          winnerBox.appendChild(winnerHeader);
          
          // Winner numbers
          const numbersContainer = document.createElement('div');
          numbersContainer.style.padding = '20px';
          numbersContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';
          numbersContainer.style.display = 'flex';
          numbersContainer.style.flexWrap = 'wrap';
          numbersContainer.style.justifyContent = 'center';
          numbersContainer.style.gap = '12px';
          
          winningCombo.numbers.forEach(number => {
            const isHit = allDrawnNumbers.includes(number);
            
            const ball = document.createElement('div');
            ball.className = 'pdf-number-ball';
            ball.style.width = '32px';
            ball.style.height = '32px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'inline-flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontWeight = 'bold';
            ball.style.fontSize = '14px';
            
            // Format number with leading zero
            const formattedNumber = String(number).padStart(2, '0');
            
            // All numbers are hits in winning combination
            ball.style.backgroundColor = 'white';
            ball.style.color = '#25C17E';
            ball.style.border = '2px solid #25C17E';
            
            ball.textContent = formattedNumber;
            numbersContainer.appendChild(ball);
          });
          
          winnerBox.appendChild(numbersContainer);
          reportElement.appendChild(winnerBox);
        });
      });
    }
    
    // Sort players alphabetically (excluding winners)
    const regularPlayers = [...game.players]
      .filter(p => !winnerIds.includes(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Container for masonry layout
    const playersContainer = document.createElement('div');
    playersContainer.className = 'pdf-masonry';
    playersContainer.style.columnCount = '2';
    playersContainer.style.columnGap = '15px';
    
    // Add regular players in masonry layout
    regularPlayers.forEach(player => {
      const playerBox = document.createElement('div');
      playerBox.className = 'pdf-player-box';
      playerBox.style.backgroundColor = '#FFFFFF';
      playerBox.style.borderRadius = '8px';
      playerBox.style.marginBottom = '15px';
      playerBox.style.overflow = 'hidden';
      playerBox.style.pageBreakInside = 'avoid';
      playerBox.style.breakInside = 'avoid';
      
      // Player name header
      const playerHeader = document.createElement('div');
      playerHeader.className = 'pdf-player-header';
      playerHeader.style.backgroundColor = '#1A3F34';
      playerHeader.style.color = '#FFFFFF';
      playerHeader.style.padding = '10px';
      playerHeader.style.fontWeight = 'bold';
      playerHeader.style.textAlign = 'center';
      playerHeader.textContent = player.name;
      playerBox.appendChild(playerHeader);
      
      // Player combinations content
      const combinationsContainer = document.createElement('div');
      combinationsContainer.style.padding = '10px';
      combinationsContainer.style.backgroundColor = '#FFFFFF';
      
      if (player.combinations && player.combinations.length > 0) {
        player.combinations.forEach((combo, index) => {
          const comboRow = document.createElement('div');
          comboRow.className = 'pdf-combo-row';
          comboRow.style.backgroundColor = '#F9F9F9';
          comboRow.style.margin = '0 0 10px 0';
          
          // Create balls for each number
          combo.numbers.sort((a, b) => a - b).forEach(number => {
            const isHit = allDrawnNumbers.includes(number);
            
            const ball = document.createElement('div');
            ball.className = isHit ? 'pdf-number-hit' : 'pdf-number-miss';
            ball.style.width = '28px';
            ball.style.height = '28px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'inline-flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontSize = '12px';
            
            // Format number with leading zero
            const formattedNumber = String(number).padStart(2, '0');
            
            if (isHit) {
              ball.style.backgroundColor = '#25C17E';
              ball.style.color = '#FFFFFF';
            } else {
              ball.style.backgroundColor = '#1A1F2C';
              ball.style.color = '#FFFFFF';
              ball.style.border = '1px solid #25C17E';
            }
            
            ball.textContent = formattedNumber;
            comboRow.appendChild(ball);
          });
          
          // Add hits label
          const hitsLabel = document.createElement('div');
          hitsLabel.className = 'pdf-hits-label';
          hitsLabel.style.width = '100%';
          hitsLabel.style.textAlign = 'right';
          hitsLabel.style.fontSize = '11px';
          hitsLabel.style.marginTop = '5px';
          hitsLabel.style.color = '#666';
          hitsLabel.textContent = `${combo.hits} acertos`;
          comboRow.appendChild(hitsLabel);
          
          combinationsContainer.appendChild(comboRow);
        });
      } else {
        const noCombo = document.createElement('p');
        noCombo.textContent = 'Sem combinações';
        noCombo.style.textAlign = 'center';
        noCombo.style.padding = '10px';
        noCombo.style.color = '#999';
        combinationsContainer.appendChild(noCombo);
      }
      
      playerBox.appendChild(combinationsContainer);
      playersContainer.appendChild(playerBox);
    });
    
    reportElement.appendChild(playersContainer);
    
    // Generate PDF with specific options to prevent page breaks
    const options = {
      margin: [10, 10],
      filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true 
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Add font for consistent rendering
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
