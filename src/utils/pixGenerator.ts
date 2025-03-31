
import { encode } from 'js-base64';

interface PixData {
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
  pixKey: string;
  amount: number;
  condominiumName: string;
}

// Function to normalize text by removing accents and concatenating words
export const normalizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove accents
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remove spaces
  return normalized.replace(/\s+/g, '');
};

// Generate CRC16 checksum for PIX code
export const generateCRC16 = (payload: string): string => {
  // CRC16 implementation
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  // Process each character in the payload
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }
  
  crc &= 0xFFFF; // Ensure it's a 16-bit value
  
  // Convert to hexadecimal and pad with zeros if needed
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export const generatePixCode = (data: PixData): string => {
  // Normalize the condominium name
  const normalizedCondominiumName = normalizeText(data.condominiumName);
  
  // Format amount with 2 decimal places and no separators
  const formattedAmount = data.amount.toFixed(2);
  
  // Determine PIX key type IDs based on the key type
  let merchantKeyTypeId = '';
  let keyTypeId = '';
  
  switch (data.keyType) {
    case 'CPF':
      merchantKeyTypeId = '633';
      keyTypeId = '111';
      break;
    case 'CNPJ':
    case 'TELEFONE':
      merchantKeyTypeId = '636';
      keyTypeId = '114';
      break;
    case 'EMAIL':
      merchantKeyTypeId = '642';
      keyTypeId = '120';
      break;
    default:
      merchantKeyTypeId = '633';
      keyTypeId = '111';
  }
  
  // Build the PIX code according to the structure
  let pixCode = '';
  
  // Fixed start
  pixCode += '0002012';
  
  // Merchant key type
  pixCode += merchantKeyTypeId;
  
  // Fixed part
  pixCode += '0014BR.GOV.BCB.PIX0';
  
  // Key type
  pixCode += keyTypeId;
  
  // PIX key
  pixCode += data.pixKey;
  
  // Fixed part and amount
  pixCode += '5204000053039865406';
  pixCode += formattedAmount;
  
  // Fixed part and condominium name
  pixCode += '5802BR5901N6001C62100506';
  pixCode += normalizedCondominiumName;
  
  // Fixed part for CRC
  pixCode += '6304';
  
  // Calculate CRC
  const crc = generateCRC16(pixCode);
  
  // Add CRC to the end
  return pixCode + crc;
};

export const generatePixQRCode = async (pixCode: string): Promise<string> => {
  // Generate a URL for a QR code using a public API
  return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(pixCode)}`;
};
