import { encode } from 'js-base64';

interface PixData {
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE';
  pixKey: string;
  amount: number;
  condominiumName: string;
  matricula: string;
}

// Function to normalize text by removing accents and concatenating words
export const normalizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove accents
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remove spaces
  return normalized.replace(/\s+/g, '');
};

// Generate CRC16 checksum for PIX code - Fixed calculation method
export const generateCRC16 = (payload: string): string => {
  // Fixed CRC16 implementation based on the CCITT standard (the same as used in resident profile)
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    crc ^= (c << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export const generatePixCode = (data: PixData): string => {
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
  
  // Process phone number for TELEFONE type - add +55 prefix
  let pixKey = data.pixKey;
  if (data.keyType === 'TELEFONE') {
    // Remove any non-digit characters first
    const digits = pixKey.replace(/\D/g, '');
    // Add +55 prefix if not already present
    pixKey = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
  }
  
  // Build the PIX code according to the updated structure
  let pixCode = '';
  
  // Fixed start (unchanged)
  pixCode += '0002012';
  
  // Merchant key type (unchanged)
  pixCode += merchantKeyTypeId;
  
  // Fixed part (unchanged)
  pixCode += '0014BR.GOV.BCB.PIX0';
  
  // Key type (unchanged)
  pixCode += keyTypeId;
  
  // PIX key (unchanged)
  pixCode += pixKey;
  
  // Fixed part and amount (unchanged)
  pixCode += '5204000053039865406';
  pixCode += formattedAmount;
  
  // Fixed part for receiver info
  pixCode += '5802BR5901N6001C62';
  
  // Count characters for the dynamic part - storing data for the "05" size part
  const countPart = pixCode.length;
  
  // Fixed "05" part
  pixCode += '05';
  
  // Concatenate matricula+HIST+amount as per the new requirements
  pixCode += `${data.matricula}HIST${formattedAmount.replace('.', '')}`;
  
  // Fixed part for CRC
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
