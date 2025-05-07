
/**
 * Creates a number ball with proper vertical alignment
 * Ensures only hit numbers are green and bold as specified
 */
export const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('div');
  ball.className = 'pdf-number-ball';
  ball.style.width = '36px';
  ball.style.height = '36px';
  ball.style.borderRadius = '50%';
  ball.style.display = 'flex';
  ball.style.justifyContent = 'center';
  ball.style.alignItems = 'center';
  ball.style.position = 'relative';
  ball.style.lineHeight = '1';
  ball.style.margin = '0 10px'; // 20px between circles as requested
  
  // Format number with leading zero
  const formattedNumber = String(number).padStart(2, '0');
  
  // Style based on hit status - ensuring only hit numbers are green and bold
  if (isHit) {
    ball.style.backgroundColor = color; // Green background for hit numbers
    ball.style.color = 'white'; // White text for contrast
    ball.style.fontWeight = '900'; // Black weight for hit numbers (as requested)
    ball.style.fontSize = '15px'; // Slightly larger for hit numbers
  } else {
    ball.style.backgroundColor = '#1A1F2C'; // Dark background for non-hits
    ball.style.color = '#FFFFFF'; // White text
    ball.style.border = `1px solid ${color}`; // Green border
    ball.style.fontWeight = '400'; // Normal weight for non-hits
    ball.style.fontSize = '14px'; // Standard size for non-hit numbers
  }
  
  // Inner span for proper vertical centering
  const innerSpan = document.createElement('span');
  innerSpan.textContent = formattedNumber;
  innerSpan.style.display = 'inline-block';
  innerSpan.style.textAlign = 'center';
  innerSpan.style.position = 'absolute';
  innerSpan.style.top = '50%';
  innerSpan.style.left = '50%';
  innerSpan.style.transform = 'translate(-50%, -50%)'; // Perfect centering
  
  ball.appendChild(innerSpan);
  return ball;
};
