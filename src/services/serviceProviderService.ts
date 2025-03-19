
import { ServiceProvider, ServiceType } from '@/types/serviceProvider';

// Function to search service providers using Google Maps Places API
export const searchServiceProviders = async (
  cep: string, 
  serviceType: ServiceType
): Promise<ServiceProvider[]> => {
  console.log(`Searching for ${serviceType} providers in CEP: ${cep}`);
  
  try {
    // Create the query based on service type and location
    const query = `${serviceType} serviços próximo a ${cep}`;
    
    // In Vite, we use import.meta.env instead of process.env
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'mock-api-key';
    
    // Create the API URL (using Google Places API)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${apiKey}`;
    
    // Make the request to Google Places API (in a real app, this would be done via a backend service)
    // For now, we'll continue to use mock data but structured to mimic the expected response
    console.log('Would request:', url);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Extract region code from CEP to generate region-specific data
    const regionCode = getRegionFromCep(cep);
    
    // Use the last 5 digits of the CEP to seed randomness
    const cepSeed = parseInt(cep.replace(/\D/g, '').slice(-5)) || 0;
    
    // Generate realistic mock service providers that simulate Google Places data
    const mockProviders: ServiceProvider[] = Array.from({ length: 12 }, (_, i) => {
      // Generate realistic business names based on service type
      const businessNames = {
        'Eletricista': ['Elétrica Express', 'Serviços Elétricos Silva', 'Eletricistas Unidos', 'Instalações Elétricas JC', 'Eletricista 24h', 'Rede Elétrica', 'Força & Luz', 'Eletrotécnica BR', 'Ligações Elétricas', 'Elétrica Doméstica', 'Instalações Flash', 'Luz & Cia'],
        'Pintor': ['Pintores Profissionais', 'Cores & Cia', 'Pintura Expressa', 'Tintas & Arte', 'Renovação Pinturas', 'Pincel de Ouro', 'Pintura Residencial', 'Arte em Cores', 'Pintura Comercial', 'Pintura Decorativa', 'Pinturas Mestre', 'Cor & Estilo'],
        'Encanador': ['Hidroserv', 'Encanadores Express', 'Água & Cia', 'Tubos & Conexões', 'Hidráulica Geral', 'Vazamentos Zero', 'Encanação Profissional', 'Reparo Hidráulico', 'Água Fácil', 'Canos & Cia', 'Hidrotec', 'Tubos Express'],
        'Diarista': ['Limpeza Express', 'Faxina Completa', 'Casa & Cia Limpezas', 'Diaristas Profissionais', 'Limpeza Total', 'Serviços Domésticos', 'Limpeza Perfeita', 'Limpeza Residencial', 'Faxina Rápida', 'Limpeza Geral', 'Serviços do Lar', 'Brilho Total'],
        'Pedreiro': ['Construções Silva', 'Reformas Express', 'Alvenaria Profissional', 'Obras & Cia', 'Construções Rápidas', 'Mão de Obra Especializada', 'Reforma Geral', 'Construção Civil', 'Mestre de Obras', 'Reformas & Reparos', 'Construir & Cia', 'Renovação Obras']
      };
      
      // Use CEP to seed pseudo-random generation
      const seedMultiplier = (cepSeed * (i + 1)) % 100 / 100;
      
      // Generate realistic ratings between 3.0 and 5.0, slightly influenced by CEP
      const ratingBase = 3.0 + (seedMultiplier * 2.0);
      const rating = Math.min(5.0, Math.max(3.0, ratingBase)).toFixed(1);
      
      const reviews = Math.floor((seedMultiplier * 150) + 5);
      const yearsInBusiness = Math.floor((seedMultiplier * 15) + 1);
      
      // Generate random distance between 0.5 and 20 km, influenced by CEP and index
      // This ensures different CEPs will get different distance patterns
      const distanceBase = 0.5 + ((seedMultiplier + (i * 0.1)) * 19.5);
      const distanceValue = distanceBase.toFixed(1);
      
      // Get region-specific data
      const { streets, areaCode } = getRegionalData(regionCode);

      // Select street based on index and CEP
      const streetIndex = (i + Math.floor(cepSeed % 12)) % streets.length;
      const streetName = streets[streetIndex];
      
      // Generate building number
      const buildingNumber = Math.floor(seedMultiplier * 1000) + 100;
      
      return {
        id: `place-${i}-${serviceType}-${cep}`,
        name: businessNames[serviceType][i],
        serviceType,
        rating: parseFloat(rating),
        reviewCount: reviews,
        phone: `(${areaCode}) ${Math.floor(seedMultiplier * 90000) + 10000}-${Math.floor(seedMultiplier * 9000) + 1000}`,
        address: `R. ${streetName}, ${buildingNumber} - Próximo ao CEP ${cep}`,
        yearsInBusiness,
        openingHours: `${Math.floor(seedMultiplier * 3) + 7}h às ${Math.floor(seedMultiplier * 4) + 17}h`,
        distance: `${distanceValue} km`
      };
    });
    
    // Filter providers within 10km
    const providersWithin10km = mockProviders.filter(provider => {
      const distanceValue = parseFloat(provider.distance.split(' ')[0]);
      return distanceValue <= 10;
    });
    
    // Sort by rating (highest first) and take the top 6
    return providersWithin10km
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    
  } catch (error) {
    console.error('Error searching for service providers:', error);
    throw new Error('Falha ao buscar prestadores de serviço. Por favor, tente novamente.');
  }
};

// Helper function to extract region from CEP
function getRegionFromCep(cep: string): string {
  // Extract the first two digits of the CEP to determine the region
  const cepNumber = cep.replace(/\D/g, '');
  const firstDigits = cepNumber.substring(0, 2);
  
  // Basic mapping of CEP ranges to states in Brazil
  if (firstDigits >= '01' && firstDigits <= '19') return 'SP';
  if (firstDigits >= '20' && firstDigits <= '28') return 'RJ';
  if (firstDigits >= '29' && firstDigits <= '29') return 'ES';
  if (firstDigits >= '30' && firstDigits <= '39') return 'MG';
  if (firstDigits >= '40' && firstDigits <= '48') return 'BA';
  if (firstDigits >= '49' && firstDigits <= '49') return 'SE';
  if (firstDigits >= '50' && firstDigits <= '56') return 'PE';
  if (firstDigits >= '57' && firstDigits <= '57') return 'AL';
  if (firstDigits >= '58' && firstDigits <= '58') return 'PB';
  if (firstDigits >= '59' && firstDigits <= '59') return 'RN';
  if (firstDigits >= '60' && firstDigits <= '63') return 'CE';
  if (firstDigits >= '64' && firstDigits <= '64') return 'PI';
  if (firstDigits >= '65' && firstDigits <= '65') return 'MA';
  if (firstDigits >= '66' && firstDigits <= '68') return 'PA';
  if (firstDigits >= '69' && firstDigits <= '69') return 'AM';
  if (firstDigits >= '70' && firstDigits <= '73') return 'DF';
  if (firstDigits >= '74' && firstDigits <= '76') return 'GO';
  if (firstDigits >= '77' && firstDigits <= '77') return 'TO';
  if (firstDigits >= '78' && firstDigits <= '78') return 'MT';
  if (firstDigits >= '79' && firstDigits <= '79') return 'MS';
  if (firstDigits >= '80' && firstDigits <= '87') return 'PR';
  if (firstDigits >= '88' && firstDigits <= '89') return 'SC';
  if (firstDigits >= '90' && firstDigits <= '99') return 'RS';
  
  // Default to SP if no match
  return 'SP';
}

// Function to get region-specific data for mock providers
function getRegionalData(regionCode: string) {
  // Common street names in Brazil by region
  const regionalStreets: Record<string, string[]> = {
    'SP': ['Paulista', 'Jabaquara', 'Ibirapuera', 'São João', 'Santos', 'Ipiranga', 'Pinheiros', 'Consolação', 'Luz', 'Butantã', 'Morumbi', 'Anhangabaú'],
    'RJ': ['Copacabana', 'Ipanema', 'Leblon', 'Tijuca', 'Maracanã', 'Botafogo', 'Flamengo', 'Méier', 'Barra', 'Jacarepaguá', 'Lapa', 'Niterói'],
    'MG': ['Savassi', 'Mangabeiras', 'Pampulha', 'Buritis', 'Serra', 'Funcionários', 'Barreiro', 'Contagem', 'Betim', 'Santa Efigênia', 'Cidade Nova', 'Belvedere'],
    'BA': ['Barra', 'Pelourinho', 'Pituba', 'Itapuã', 'Amaralina', 'Campo Grande', 'Vitória', 'Graça', 'Canela', 'Bonfim', 'Brotas', 'Cabula'],
    'PB': ['Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa', 'Bancários', 'Mangabeira', 'Centro', 'Cruz das Armas', 'Jaguaribe', 'Jardim Cidade Universitária', 'Valentina', 'Altiplano'],
    'PE': ['Boa Viagem', 'Pina', 'Piedade', 'Candeias', 'Aflitos', 'Casa Forte', 'Espinheiro', 'Graças', 'Derby', 'Casa Amarela', 'Água Fria', 'Prado'],
    'CE': ['Aldeota', 'Meireles', 'Iracema', 'Centro', 'Varjota', 'Fátima', 'Cocó', 'Papicu', 'Edson Queiroz', 'Benfica', 'Messejana', 'Parangaba'],
    'DF': ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste', 'Taguatinga', 'Águas Claras', 'Guará', 'Ceilândia', 'Samambaia', 'Gama'],
    'RS': ['Moinhos de Vento', 'Bela Vista', 'Menino Deus', 'Petrópolis', 'Partenon', 'Cidade Baixa', 'Centro Histórico', 'Navegantes', 'Santana', 'Cavalhada', 'Cristal', 'Tristeza']
  };

  // Area codes by state
  const areaCodes: Record<string, string> = {
    'SP': '11',
    'RJ': '21',
    'MG': '31',
    'BA': '71',
    'PB': '83',
    'PE': '81',
    'CE': '85',
    'DF': '61',
    'RS': '51',
    'PR': '41',
    'SC': '48',
    'ES': '27',
    'GO': '62',
    'MS': '67',
    'MT': '65',
    'AL': '82',
    'SE': '79',
    'RN': '84',
    'PI': '86',
    'MA': '98',
    'PA': '91',
    'AM': '92',
    'TO': '63'
  };

  // Default streets if region not found
  const defaultStreets = ['Brasil', 'Amazonas', 'Paraná', 'São Paulo', 'Bahia', 'Ceará', 'Minas Gerais', 'Pernambuco', 'Maranhão', 'Goiás', 'Piauí', 'Alagoas'];
  
  // Return streets and area code for the region
  return {
    streets: regionalStreets[regionCode] || defaultStreets,
    areaCode: areaCodes[regionCode] || '00'
  };
}
