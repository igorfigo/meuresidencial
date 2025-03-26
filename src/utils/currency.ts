
// Functions for formatting and parsing monetary values

// Format a number to BRL format (Brazilian Real)
export const formatToBRL = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  
  if (isNaN(numValue)) return '0,00';
  
  // Format with 2 decimal places and use comma as separator
  return numValue.toFixed(2).replace('.', ',');
};

// Format a number to currency (with R$ prefix)
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  // Format to BRL format with R$ prefix
  return `R$ ${numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Convert from BRL format (with comma) to number
export const BRLToNumber = (value: string): number => {
  if (!value || value === '') return 0;
  
  // Remove R$ prefix and any non-numeric characters except for comma and period
  const cleanValue = value.replace(/R\$\s*/g, '').replace(/[^\d,\.]/g, '');
  
  // Replace comma with dot for proper number parsing
  const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
};

// Format an input number into currency display format (adds thousand separators)
export const formatCurrencyInput = (value: string): string => {
  if (!value) return '0,00';
  
  // Convert the string to a number (cents)
  const cents = parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(cents)) return '0,00';
  
  // Convert cents to a proper decimal number
  const decimalValue = cents / 100;
  
  // Format with thousand separators and two decimal places
  return decimalValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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
