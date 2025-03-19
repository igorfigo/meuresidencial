
// Extend the existing cepService with functions to format and validate CEP

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

// Simulate fetching address by CEP (in a real app, this would call an API)
export const fetchAddressByCep = async (cep: string) => {
  // Remove non-numeric characters for validation
  const numericCep = cep.replace(/\D/g, '');
  
  if (numericCep.length !== 8) {
    throw new Error('CEP inválido');
  }
  
  // In a real app, we would call an API here
  // For now, just return a mock response after a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    cep: cep,
    logradouro: 'Rua Exemplo',
    bairro: 'Bairro Teste',
    cidade: 'São Paulo',
    uf: 'SP'
  };
};
