
// Custom CRC16 implementation that doesn't rely on Buffer
const crc16ccitt = (input: string): number => {
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    crc ^= (c << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) & 0xFFFF) ^ polynomial;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  return crc & 0xFFFF;
};

interface PixData {
  keyType: string;
  key: string;
  amount: number;
  receiverName: string;
  city: string;
  reference?: string;
}

// Função para limpar texto removendo acentos e caracteres especiais
const cleanText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Função para formatar valor com 2 casas decimais
const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// Função para gerar o código PIX copia e cola
export const generatePixString = (data: PixData): string => {
  // Dados obrigatórios
  const payload: Record<string, string> = {
    '00': '01', // Payload Format Indicator (fixo '01')
    '01': '11', // Point of Initiation Method (11 = QR estático)
  };

  // Merchant Account Information
  const merchantAccountInfo: Record<string, string> = {
    '00': 'br.gov.bcb.pix', // GUI (fixo 'br.gov.bcb.pix')
  };

  // Definir o tipo da chave e o valor
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
      merchantAccountInfo['01'] = '04'; // Telefone
      break;
    case 'aleatoria':
    case 'evp':
      merchantAccountInfo['01'] = '05'; // Chave aleatória
      break;
    default:
      merchantAccountInfo['01'] = '05'; // Padrão para chave aleatória
  }

  merchantAccountInfo['02'] = data.key;

  // Transformar merchant account info em string
  const merchantAccountInfoString = Object.entries(merchantAccountInfo)
    .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
    .join('');

  payload['26'] = `${merchantAccountInfoString.length.toString().padStart(2, '0')}${merchantAccountInfoString}`;

  // Merchant Category Code (fixo '0000')
  payload['52'] = '0000';

  // Transaction Currency (986 = BRL)
  payload['53'] = '986';

  // Transaction Amount
  if (data.amount > 0) {
    payload['54'] = formatAmount(data.amount);
  }

  // Country Code (BR)
  payload['58'] = 'BR';

  // Merchant Name (limitado a 25 caracteres)
  const cleanedName = cleanText(data.receiverName).substring(0, 25);
  payload['59'] = cleanedName;

  // Merchant City (limitado a 15 caracteres)
  const cleanedCity = cleanText(data.city).substring(0, 15);
  payload['60'] = cleanedCity;

  // Informações adicionais (referência)
  if (data.reference) {
    const additionalInfo: Record<string, string> = {
      '05': data.reference.substring(0, 50),
    };

    const additionalInfoString = Object.entries(additionalInfo)
      .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
      .join('');

    payload['62'] = `${additionalInfoString.length.toString().padStart(2, '0')}${additionalInfoString}`;
  }

  // Construir a string do PIX sem o CRC
  let pixString = Object.entries(payload)
    .map(([id, value]) => `${id}${value.length.toString().padStart(2, '0')}${value}`)
    .join('');

  // Adicionar o campo de CRC (ainda não calculado)
  pixString += '6304';

  // Calcular o CRC16
  const crc = crc16ccitt(pixString).toString(16).toUpperCase().padStart(4, '0');

  // Retornar a string PIX completa
  return pixString + crc;
};
