
/**
 * Creates a number ball with proper vertical alignment
 */
export const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('div');
  ball.className = 'pdf-number-ball';
  ball.style.width = '40px';
  ball.style.height = '40px';
  ball.style.borderRadius = '50%';
  ball.style.display = 'flex';
  ball.style.justifyContent = 'center';
  ball.style.alignItems = 'center';
  ball.style.fontWeight = 'bold';
  ball.style.fontSize = '16px';
  
  // Format number with leading zero
  const formattedNumber = String(number).padStart(2, '0');
  
  // Number styling based on hit status
  if (isHit) {
    ball.style.backgroundColor = color; // Green background for hit numbers
    ball.style.color = 'white'; // White text for contrast
    ball.style.border = `2px solid ${color}`;
  } else {
    ball.style.backgroundColor = '#1A1F2C';
    ball.style.color = '#FFFFFF';
    ball.style.border = `1px solid ${color}`;
  }
  
  // Create inner span for proper vertical centering
  const innerSpan = document.createElement('span');
  innerSpan.textContent = formattedNumber;
  innerSpan.style.display = 'flex';
  innerSpan.style.justifyContent = 'center';
  innerSpan.style.alignItems = 'center';
  innerSpan.style.height = '100%';
  innerSpan.style.marginTop = '-7px'; // Critical fix for vertical alignment
  
  ball.appendChild(innerSpan);
  return ball;
};
