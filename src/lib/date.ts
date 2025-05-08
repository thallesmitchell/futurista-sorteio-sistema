
/**
 * Format a date to a localized string format
 * With improved error handling to prevent crashes
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  try {
    // Handle invalid or missing date values
    if (!date) {
      console.warn('formatDate called with null or undefined date');
      return 'Data indisponível';
    }
    
    let dateObj: Date;
    
    // Convert string to date or use provided date object
    if (typeof date === 'string') {
      dateObj = new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date string provided to formatDate: ${date}`);
        return 'Data inválida';
      }
    } else if (date instanceof Date) {
      // Ensure the Date object is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid Date object provided to formatDate');
        return 'Data inválida';
      }
      dateObj = date;
    } else {
      console.error('Invalid date type provided to formatDate:', typeof date);
      return 'Formato inválido';
    }
    
    // Format as day/month/year with month name in Portuguese
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // Get month name in Portuguese
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error in formatDate:', error);
    return 'Erro na formatação';
  }
};
