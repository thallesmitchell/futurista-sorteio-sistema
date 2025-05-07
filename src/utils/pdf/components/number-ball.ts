
/**
 * Creates a number ball with proper vertical alignment
 */
export const createNumberBall = (number: number, color: string, isHit: boolean): HTMLElement => {
  const ball = document.createElement('span');
  ball.className = 'pdf-number-ball';
  ball.style.display = 'inline-block';
  ball.style.margin = '0 2px';
  
  // Format number with leading zero
  const formattedNumber = String(number).padStart(2, '0');
  
  // Style based on hit status
  if (isHit) {
    ball.style.color = color; // Green text for hit numbers
    ball.style.fontWeight = '900'; // Black weight for hit numbers (as requested)
  } else {
    ball.style.color = '#FFFFFF'; // White text for non-hits
    ball.style.fontWeight = '400'; // Normal weight for non-hits
  }
  
  ball.textContent = formattedNumber;
  return ball;
};
