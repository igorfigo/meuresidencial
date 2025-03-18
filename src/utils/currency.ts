
// Functions for formatting and parsing monetary values

// Format a number to BRL format (Brazilian Real)
export const formatToBRL = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  
  if (isNaN(numValue)) return '';
  
  // Format with 2 decimal places and use comma as separator
  return numValue.toFixed(2).replace('.', ',');
};

// Convert from BRL format (with comma) to number
export const BRLToNumber = (value: string): number => {
  if (!value || value === '') return 0;
  
  // Replace comma with dot for proper number parsing
  const normalizedValue = value.replace(/\./g, '').replace(',', '.');
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
};

// Format CNPJ: XX.XXX.XXX/XXXX-XX
export const formatCnpj = (value: string): string => {
  if (!value) return '';
  
  // Remove non-numeric characters
  const digits = value.replace(/\D/g, '');
  
  // Apply CNPJ mask
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Format CEP: XXXXX-XXX
export const formatCep = (value: string): string => {
  if (!value) return '';
  
  // Remove non-numeric characters
  const digits = value.replace(/\D/g, '');
  
  // Apply CEP mask
  return digits
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

// Format phone: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove non-numeric characters
  const digits = value.replace(/\D/g, '');
  
  // Apply phone mask based on length
  if (digits.length <= 10) {
    // (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // (XX) XXXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
};
