
import { encode } from 'js-base64';

interface PixData {
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
  pixKey: string;
  amount: number;
  condominiumName: string;
  matricula: string;
  unit?: string;
  isHistorical?: boolean;
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
  // For historical data, use 249.00 as fixed amount
  const amount = data.isHistorical ? 249.00 : data.amount;
  
  // Format amount with 2 decimal places and no separators
  const formattedAmount = amount.toFixed(2);
  
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
  
  // Process phone number for TELEFONE type - add +55 prefix
  let pixKey = data.pixKey;
  if (data.keyType === 'TELEFONE') {
    // Remove any non-digit characters first
    const digits = pixKey.replace(/\D/g, '');
    // Add +55 prefix if not already present
    pixKey = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
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
  pixCode += pixKey;
  
  // Fixed part and amount
  pixCode += '5204000053039865406';
  pixCode += formattedAmount;
  
  // Fixed part
  pixCode += '5802BR5901N6001C62';
  
  // Prepare description
  let description = '';
  
  // For historical data, format is "matricula+HIST24900" (changed from HIST249.00)
  if (data.isHistorical) {
    description = `${data.matricula}HIST24900`;
  } else {
    // For regular payments, use the normalized condominium name + unit (if available)
    const condoName = normalizeText(data.condominiumName);
    description = data.unit ? `${condoName}${data.unit}` : condoName;
  }
  
  // Calculate description part including the ID (05) and length
  const descriptionPart = `05${description.length.toString().padStart(2, '0')}${description}`;
  
  // Add count of characters between "5802BR5901N6001C62" and "6304"
  // This is the length of the description part (including 05 and the length digits)
  const countBetweenFixedParts = descriptionPart.length.toString().padStart(2, '0');
  pixCode += countBetweenFixedParts;
  
  // Now add the description part (05 + length + description)
  pixCode += descriptionPart;
  
  // Add the fixed "6304" for CRC
  pixCode += '6304';
  
  // Calculate CRC
  const crc = generateCRC16(pixCode);
  
  // Add CRC to the end
  return pixCode + crc;
};

export const generatePixQRCode = async (pixCode: string): Promise<string> => {
  try {
    // Use a more reliable QR code generation service with appropriate size and error correction
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}&margin=10&ecc=M`;
    
    // For debugging - try to pre-fetch the image to see if it works
    const checkResponse = await fetch(qrCodeUrl, { method: 'HEAD' });
    
    if (!checkResponse.ok) {
      console.error('QR code API response not OK:', checkResponse.status);
      // Fallback to Google Charts API if first service fails
      return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(pixCode)}&chld=M|4`;
    }
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to Google Charts API
    return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(pixCode)}&chld=M|4`;
  }
};
