
/**
 * Creates a number ball with proper vertical alignment
 */
export const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('div');
  ball.className = 'pdf-number-ball';
  ball.style.width = '36px'; // Tamanho reduzido
  ball.style.height = '36px'; // Tamanho reduzido
  ball.style.borderRadius = '50%';
  ball.style.display = 'flex';
  ball.style.justifyContent = 'center';
  ball.style.alignItems = 'center';
  ball.style.fontSize = '14px'; // Tamanho da fonte reduzido
  ball.style.position = 'relative';
  ball.style.lineHeight = '1';
  ball.style.margin = '0 10px'; // Espaçamento entre os números (20px entre círculos)
  
  // Formata o número com zero à esquerda
  const formattedNumber = String(number).padStart(2, '0');
  
  // Estilo baseado no estado de acerto
  if (isHit) {
    ball.style.backgroundColor = color; // Fundo verde para números acertados
    ball.style.color = 'white'; // Texto branco para contraste
    ball.style.fontWeight = '900'; // Peso black para números acertados
  } else {
    ball.style.backgroundColor = '#1A1F2C'; // Fundo escuro para não acertados
    ball.style.color = '#FFFFFF'; // Texto branco
    ball.style.border = `1px solid ${color}`; // Borda verde
    ball.style.fontWeight = '400'; // Peso normal para não acertados
  }
  
  // Span interno para centralização vertical adequada
  const innerSpan = document.createElement('span');
  innerSpan.textContent = formattedNumber;
  innerSpan.style.display = 'inline-block';
  innerSpan.style.textAlign = 'center';
  innerSpan.style.position = 'absolute';
  innerSpan.style.top = '50%';
  innerSpan.style.left = '50%';
  innerSpan.style.transform = 'translate(-50%, -50%)'; // Centralização perfeita
  innerSpan.style.fontSize = isHit ? '15px' : '14px'; // Fonte maior para acertados
  
  ball.appendChild(innerSpan);
  return ball;
};
