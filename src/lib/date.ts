
/**
 * Format a date to a localized string format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format as day/month/year
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  // Get month name in Portuguese
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};
