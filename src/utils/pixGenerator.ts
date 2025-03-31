
// Custom CRC16-CCITT-FALSE implementation
const crc16ccitt = (input: string): string => {
  // Polynomial: 0x1021
  const polynomial = 0x1021;
  // Initial value: 0xFFFF
  let crc = 0xFFFF;
  
  // Process each character in the input string
  for (let i = 0; i < input.length; i++) {
    // Get the character code (byte)
    const c = input.charCodeAt(i);
    
    // Process each bit in the byte
    for (let j = 0; j < 8; j++) {
      const bit = (c >> (7 - j)) & 1;
      const msb = (crc >> 15) & 1;
      
      // Shift CRC left by 1 bit
      crc = (crc << 1) & 0xFFFF;
      
      // If XOR of MSB and current bit is 1, XOR with polynomial
      if (msb ^ bit) {
        crc ^= polynomial;
      }
    }
  }
  
  // Return CRC as uppercase hexadecimal
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

interface PixData {
  keyType: string;
  key: string;
  amount: number;
  matricula: string; // Changed from receiverName to matricula
  city: string;
  reference?: string;
}

// Function to clean text by removing accents and special characters
const cleanText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Function to format amount with 2 decimal places
const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// Function to generate PIX copy and paste code
export const generatePixString = (data: PixData): string => {
  // Required data
  const payload: Record<string, string> = {
    '00': '01', // Payload Format Indicator (fixed '01')
    '01': '11', // Point of Initiation Method (11 = static QR)
  };

  // Merchant Account Information
  const merchantAccountInfo: Record<string, string> = {
    '00': 'br.gov.bcb.pix', // GUI (fixed 'br.gov.bcb.pix')
  };

  // Define key type and value
  switch (data.keyType.toLowerCase()) {
    case 'cpf':
      merchantAccountInfo['01'] = '01'; // CPF
      break;
    case 'cnpj':
      merchantAccountInfo['01'] = '02'; // CNPJ
      break;
    case 'email':
      merchantAccountInfo['01'] = '03'; // Email
      break;
    case 'telefone':
    case 'celular':
      merchantAccountInfo['01'] = '04'; // Phone
      break;
    case 'aleatoria':
    case 'evp':
      merchantAccountInfo['01'] = '05'; // Random key
      break;
    default:
      merchantAccountInfo['01'] = '05'; // Default to random key
  }

  merchantAccountInfo['02'] = data.key;

  // Transform merchant account info into string
  const merchantAccountInfoString = Object.entries(merchantAccountInfo)
    .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
    .join('');

  payload['26'] = `${merchantAccountInfoString.length.toString().padStart(2, '0')}${merchantAccountInfoString}`;

  // Merchant Category Code (fixed '0000')
  payload['52'] = '0000';

  // Transaction Currency (986 = BRL)
  payload['53'] = '986';

  // Transaction Amount
  if (data.amount > 0) {
    payload['54'] = formatAmount(data.amount);
  }

  // Country Code (BR)
  payload['58'] = 'BR';

  // Merchant Name (using matricula instead of name, limited to 25 characters)
  const cleanedMatricula = cleanText(data.matricula).substring(0, 25);
  payload['59'] = cleanedMatricula;

  // Merchant City (limited to 15 characters)
  // Enhanced cleaning for city: remove accents and concatenate words
  const cleanedCity = cleanText(data.city)
    .replace(/\s+/g, '') // Remove all spaces to concatenate words
    .substring(0, 15);
    
  payload['60'] = cleanedCity;

  // Additional information (reference)
  if (data.reference) {
    const additionalInfo: Record<string, string> = {
      '05': data.reference.substring(0, 50),
    };

    const additionalInfoString = Object.entries(additionalInfo)
      .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
      .join('');

    payload['62'] = `${additionalInfoString.length.toString().padStart(2, '0')}${additionalInfoString}`;
  }

  // Build PIX string without CRC
  let pixString = Object.entries(payload)
    .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
    .join('');

  // Add CRC field (not yet calculated)
  pixString += '6304';

  // Calculate CRC16-CCITT-FALSE
  const crc = crc16ccitt(pixString);

  // Return complete PIX string
  return pixString + crc;
};
