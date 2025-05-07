
/**
 * Creates a number ball with proper vertical alignment
 */
export const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('div');
  ball.className = 'pdf-number-ball';
  ball.style.width = '36px'; // Reduced size
  ball.style.height = '36px'; // Reduced size
  ball.style.borderRadius = '50%';
  ball.style.display = 'flex';
  ball.style.justifyContent = 'center';
  ball.style.alignItems = 'center';
  ball.style.fontSize = '14px'; // Reduced font size
  ball.style.position = 'relative';
  ball.style.lineHeight = '1';
  ball.style.margin = '0 10px'; // Spacing between numbers (20px between circles)
  
  // Format number with leading zero
  const formattedNumber = String(number).padStart(2, '0');
  
  // Style based on hit status
  if (isHit) {
    ball.style.backgroundColor = color; // Green background for hit numbers
    ball.style.color = 'white'; // White text for contrast
    ball.style.fontWeight = '900'; // Black weight for hit numbers
  } else {
    ball.style.backgroundColor = '#1A1F2C'; // Dark background for non-hits
    ball.style.color = '#FFFFFF'; // White text
    ball.style.border = `1px solid ${color}`; // Green border
    ball.style.fontWeight = '400'; // Normal weight for non-hits
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
  innerSpan.style.fontSize = isHit ? '15px' : '14px'; // Larger font for hits
  
  ball.appendChild(innerSpan);
  return ball;
};
