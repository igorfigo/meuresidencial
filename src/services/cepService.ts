
// Extend the existing cepService with a new function to format CEP input
import { fetchAddressByCep } from '@/services/cepService';

export const formatCep = (cep: string): string => {
  // Remove non-numeric characters
  const numericCep = cep.replace(/\D/g, '');
  
  // Format as #####-###
  if (numericCep.length <= 5) {
    return numericCep;
  } else {
    return `${numericCep.slice(0, 5)}-${numericCep.slice(5, 8)}`;
  }
};

export const validateCep = (cep: string): boolean => {
  const numericCep = cep.replace(/\D/g, '');
  return numericCep.length === 8;
};

// Re-export the fetchAddressByCep function
export { fetchAddressByCep };
