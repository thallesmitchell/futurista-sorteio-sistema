
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
    themeColor: '#39FF14'
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
            themeColor: data.theme_color || '#39FF14'
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
    
    // Criar as cores com base no tema do administrador
    const adminColor = profileData.themeColor;
    const adminColorLight = adjustColor(adminColor, 40); // Versão mais clara
    const adminColorDark = adjustColor(adminColor, -40); // Versão mais escura
    
    // Create report container
    const reportElement = document.createElement('div');
    reportElement.style.fontFamily = 'Arial, sans-serif';
    reportElement.style.padding = '20px';
    reportElement.style.margin = '0';
    reportElement.style.backgroundColor = '#ffffff';
    reportElement.style.maxWidth = '100%';
    
    // Header with title
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'center';
    header.style.alignItems = 'center';
    header.style.marginBottom = '30px';
    
    // Title
    const title = document.createElement('div');
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '24px';
    title.style.color = adminColorDark;
    
    // Format date as in the example (06/maio/2025)
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const formattedDateForDisplay = `${day}/${month}/${year}`;
    
    title.innerHTML = `${reportTitle}<br/>${formattedDateForDisplay}`;
    header.appendChild(title);
    
    reportElement.appendChild(header);
    
    // Get all drawn numbers
    const allDrawnNumbers = game.dailyDraws.flatMap(draw => draw.numbers);
    
    // Extract winners if any
    const winners = game.winners || [];
    const winnerIds = winners.map(w => w.id);
    
    // If there are winners, show them at the top with special styling
    if (winners.length > 0) {
      const winnersSection = document.createElement('div');
      winnersSection.style.marginBottom = '30px';
      winnersSection.style.width = '100%';
      
      winners.forEach(winner => {
        const winnerBox = document.createElement('div');
        winnerBox.style.backgroundColor = '#e9f5e9';
        winnerBox.style.borderRadius = '8px';
        winnerBox.style.overflow = 'hidden';
        winnerBox.style.boxShadow = `0 4px 14px rgba(0,0,0,0.15)`;
        winnerBox.style.border = `3px solid ${adminColor}`;
        winnerBox.style.width = '100%';
        winnerBox.style.marginBottom = '20px';
        winnerBox.style.breakInside = 'avoid';
        
        // Winner name header
        const nameHeader = document.createElement('div');
        nameHeader.style.backgroundColor = adminColor;
        nameHeader.style.color = '#ffffff';
        nameHeader.style.padding = '12px 15px';
        nameHeader.style.fontWeight = 'bold';
        nameHeader.style.textAlign = 'center';
        nameHeader.style.fontSize = '18px';
        nameHeader.style.display = 'flex';
        nameHeader.style.justifyContent = 'center';
        nameHeader.style.alignItems = 'center';
        nameHeader.style.textShadow = '1px 1px 2px rgba(0,0,0,0.2)';
        
        // Add trophy icon
        const leftTrophy = document.createElement('span');
        leftTrophy.innerHTML = '🏆';
        leftTrophy.style.fontSize = '22px';
        leftTrophy.style.marginRight = '10px';
        nameHeader.appendChild(leftTrophy);
        
        // Add winner name
        const winnerName = document.createElement('span');
        winnerName.textContent = "GANHADOR - " + winner.name;
        nameHeader.appendChild(winnerName);
        
        // Add right trophy icon
        const rightTrophy = document.createElement('span');
        rightTrophy.innerHTML = '🏆';
        rightTrophy.style.fontSize = '22px';
        rightTrophy.style.marginLeft = '10px';
        nameHeader.appendChild(rightTrophy);
        
        winnerBox.appendChild(nameHeader);
        
        // Winner combinations
        const combinationsContainer = document.createElement('div');
        combinationsContainer.style.padding = '20px';
        combinationsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        
        if (winner.combinations && winner.combinations.length > 0) {
          winner.combinations.forEach((combo, comboIndex) => {
            const hasWinningCombo = combo.hits === 6;
            
            const comboRow = document.createElement('div');
            comboRow.style.display = 'flex';
            comboRow.style.flexWrap = 'wrap';
            comboRow.style.justifyContent = 'center';
            comboRow.style.alignItems = 'center';
            comboRow.style.gap = '12px';
            comboRow.style.marginBottom = '15px';
            
            // If winning combination, add highlight
            if (hasWinningCombo) {
              comboRow.style.backgroundColor = `rgba(${hexToRgb(adminColor)}, 0.2)`;
              comboRow.style.padding = '12px';
              comboRow.style.borderRadius = '8px';
              comboRow.style.border = `1px solid ${adminColor}`;
              
              const winningLabel = document.createElement('div');
              winningLabel.textContent = "COMBINAÇÃO PREMIADA!";
              winningLabel.style.width = '100%';
              winningLabel.style.textAlign = 'center';
              winningLabel.style.fontWeight = 'bold';
              winningLabel.style.color = adminColorDark;
              winningLabel.style.fontSize = '16px';
              winningLabel.style.marginBottom = '10px';
              winningLabel.style.paddingBottom = '8px';
              winningLabel.style.borderBottom = `1px dashed ${adminColor}`;
              comboRow.appendChild(winningLabel);
            }
            
            // Create numbered balls
            combo.numbers.sort((a, b) => a - b).forEach(number => {
              const isHit = allDrawnNumbers.includes(number);
              
              const ball = document.createElement('span');
              ball.style.width = '32px';
              ball.style.height = '32px';
              ball.style.borderRadius = '50%';
              ball.style.display = 'inline-flex';
              ball.style.justifyContent = 'center';
              ball.style.alignItems = 'center';
              ball.style.fontWeight = 'bold';
              ball.style.fontSize = '14px';
              
              // Format the number with leading zero
              const formattedNumber = String(number).padStart(2, '0');
              
              if (isHit) {
                // Highlighted ball for hits - FUNDO VERDE SÓLIDO
                ball.style.backgroundColor = adminColor;
                ball.style.color = '#ffffff';
                ball.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
              } else {
                // Regular ball - APENAS CONTORNO
                ball.style.backgroundColor = '#1A1F2C'; // Fundo escuro
                ball.style.color = '#ffffff';
                ball.style.border = `1px solid ${adminColor}`;
                ball.style.boxShadow = `0 0 4px ${adminColor}40`;
              }
              
              ball.textContent = formattedNumber;
              comboRow.appendChild(ball);
            });
            
            combinationsContainer.appendChild(comboRow);
            
            // Add separator between combinations (except for the last one)
            if (comboIndex < winner.combinations.length - 1) {
              const separator = document.createElement('hr');
              separator.style.margin = '12px 0';
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
        
        winnerBox.appendChild(combinationsContainer);
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
    
    // Create masonry layout for regular players - seguindo EXATAMENTE o modelo da imagem 3
    const playersContainer = document.createElement('div');
    playersContainer.style.columnCount = '3';
    playersContainer.style.columnGap = '15px';
    
    regularPlayers.forEach(player => {
      // Create player box
      const playerBox = document.createElement('div');
      playerBox.style.backgroundColor = '#ffffff';
      playerBox.style.borderRadius = '8px';
      playerBox.style.border = '1px solid #e0e0e0';
      playerBox.style.overflow = 'hidden';
      playerBox.style.marginBottom = '15px';
      playerBox.style.breakInside = 'avoid';
      playerBox.style.pageBreakInside = 'avoid';
      
      // Player name header
      const nameHeader = document.createElement('div');
      nameHeader.style.backgroundColor = '#f0f0f0';
      nameHeader.style.color = '#333333';
      nameHeader.style.padding = '10px 12px';
      nameHeader.style.fontWeight = 'bold';
      nameHeader.style.textAlign = 'center';
      nameHeader.style.borderBottom = '1px solid #e0e0e0';
      
      // Add player name
      const playerName = document.createElement('span');
      playerName.textContent = player.name;
      nameHeader.appendChild(playerName);
      
      playerBox.appendChild(nameHeader);
      
      // Player combinations
      const combinationsContainer = document.createElement('div');
      combinationsContainer.style.padding = '12px';
      
      if (player.combinations && player.combinations.length > 0) {
        player.combinations.forEach((combo, comboIndex) => {
          const comboRow = document.createElement('div');
          comboRow.style.display = 'flex';
          comboRow.style.flexWrap = 'wrap';
          comboRow.style.justifyContent = 'center';
          comboRow.style.gap = '6px';
          comboRow.style.margin = '5px 0';
          comboRow.style.padding = '8px';
          comboRow.style.backgroundColor = '#f9f9f9';
          comboRow.style.borderRadius = '4px';
          
          // Create numbered balls
          combo.numbers.sort((a, b) => a - b).forEach(number => {
            const isHit = allDrawnNumbers.includes(number);
            
            const ball = document.createElement('span');
            ball.style.width = '26px';
            ball.style.height = '26px';
            ball.style.borderRadius = '50%';
            ball.style.display = 'inline-flex';
            ball.style.justifyContent = 'center';
            ball.style.alignItems = 'center';
            ball.style.fontSize = '12px';
            
            // Format the number with leading zero
            const formattedNumber = String(number).padStart(2, '0');
            
            if (isHit) {
              // Highlighted ball for hits - FUNDO VERDE SÓLIDO
              ball.style.backgroundColor = adminColor;
              ball.style.color = '#ffffff';
            } else {
              // Regular ball - APENAS CONTORNO
              ball.style.backgroundColor = '#1A1F2C'; // Fundo escuro
              ball.style.color = '#ffffff';
              ball.style.border = `1px solid ${adminColor}`;
              ball.style.boxShadow = `0 0 4px ${adminColor}40`;
            }
            
            ball.textContent = formattedNumber;
            comboRow.appendChild(ball);
          });
          
          // Adicionar contador de acertos
          const hitsLabel = document.createElement('div');
          hitsLabel.style.width = '100%';
          hitsLabel.style.textAlign = 'right';
          hitsLabel.style.fontSize = '11px';
          hitsLabel.style.marginTop = '5px';
          hitsLabel.style.color = '#666';
          hitsLabel.textContent = `${combo.hits} acertos`;
          comboRow.appendChild(hitsLabel);
          
          combinationsContainer.appendChild(comboRow);
          
          // Add separator between combinations
          if (comboIndex < player.combinations.length - 1) {
            const separator = document.createElement('hr');
            separator.style.margin = '8px 0';
            separator.style.border = '0';
            separator.style.borderBottom = '1px solid #eee';
            combinationsContainer.appendChild(separator);
          }
        });
      } else {
        const noCombo = document.createElement('p');
        noCombo.textContent = 'Sem combinações';
        noCombo.style.textAlign = 'center';
        noCombo.style.fontSize = '12px';
        noCombo.style.color = '#999';
        combinationsContainer.appendChild(noCombo);
      }
      
      playerBox.appendChild(combinationsContainer);
      playersContainer.appendChild(playerBox);
    });
    
    reportElement.appendChild(playersContainer);
    
    // Generate PDF - configuração para evitar quebras de página dentro dos boxes
    const options = {
      margin: [10, 10],
      filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${game.name.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { avoid: ['div'] }
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
  
  // Função para ajustar um cor hex (clarear ou escurecer)
  const adjustColor = (hex: string, percent: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
  };
  
  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
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
