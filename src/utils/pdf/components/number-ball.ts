
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
  ball.style.position = 'relative'; // Add position relative for better control
  
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
  innerSpan.style.display = 'inline-block';
  innerSpan.style.lineHeight = '1';
  innerSpan.style.textAlign = 'center';
  innerSpan.style.position = 'absolute';
  innerSpan.style.top = '38%'; // Changed from 42.5% to 38% as requested
  innerSpan.style.left = '50%';
  innerSpan.style.transform = 'translate(-50%, -50%)'; // Use transform for perfect centering
  
  ball.appendChild(innerSpan);
  return ball;
};
