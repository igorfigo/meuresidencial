
/**
 * Formats a number or string to Brazilian currency format (R$ 1.234,56)
 * @param value - Number or string to format
 * @returns Formatted currency string
 */
export const formatToBRL = (value: string | number): string => {
  // Convert to number and handle invalid inputs
  const numericValue = typeof value === 'string' ? 
    Number(value.replace(/\./g, '').replace(',', '.')) : 
    value;

  if (isNaN(numericValue)) return 'R$ 0,00';

  // Format to Brazilian currency
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Converts Brazilian currency format to number format for storage
 * @param value - Currency string (R$ 1.234,56)
 * @returns Number format (1234.56)
 */
export const BRLToNumber = (value: string): number => {
  // Remove R$ and spaces, replace dots, replace comma with dot
  const cleaned = value
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const number = Number(cleaned);
  return isNaN(number) ? 0 : number;
};

/**
 * Formats input value to Brazilian currency format while typing
 * @param value - Current input value
 * @returns Formatted value for display
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove all non-digits
  let numbers = value.replace(/\D/g, '');
  
  // Convert to number with 2 decimal places
  const amount = Number(numbers) / 100;
  
  // Format to Brazilian currency without the currency symbol
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

