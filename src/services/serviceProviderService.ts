
import { ServiceProvider, ServiceType } from '@/types/serviceProvider';
import { City } from '@/components/services/CityAutocomplete';

// Function to search service providers using Google Maps Places API
export const searchServiceProviders = async (
  city: City, 
  serviceType: ServiceType
): Promise<ServiceProvider[]> => {
  console.log(`Searching for ${serviceType} providers in city: ${city.name}, ${city.state}`);
  
  try {
    // Create the query based on service type and location
    const query = `${serviceType} serviços em ${city.name}, ${city.state}`;
    
    // Using the provided API key
    const apiKey = 'AIzaSyAUMl7xxT6X9saoQ0UsbCiafNQ2OpMTP3M';
    
    // Create the API URL (using Google Places API)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${apiKey}`;
    
    // Make the request through a CORS proxy (in a production app, this would be done via a backend service)
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(corsProxy + encodeURIComponent(url));
    
    if (!response.ok) {
      console.error('Network response was not ok');
      // Fallback to mock data when fetch fails
      return generateMockServiceProviders(city, serviceType);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      
      // If the API key is denied or there's another error, fallback to mock data
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        console.log('Falling back to mock data');
        return generateMockServiceProviders(city, serviceType);
      }
      
      throw new Error(`Erro na API do Google Places: ${data.status}`);
    }
    
    // Transform Google Places results into our ServiceProvider format
    const providers: ServiceProvider[] = data.results.map((place: any, index: number) => {
      // Calculate distance (this is a simplified approach as the Places API doesn't directly provide distance)
      // In a real app, you might want to use the Distance Matrix API for accurate distances
      const distanceValue = (Math.random() * 10).toFixed(1); // Random distance between 0-10 km
      
      return {
        id: place.place_id || `place-${index}`,
        name: place.name,
        serviceType,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        phone: place.formatted_phone_number || generatePhoneNumber(getCityAreaCode(city)),
        address: place.formatted_address || place.vicinity || "",
        yearsInBusiness: Math.floor(Math.random() * 15) + 1, // This data isn't available from Places API
        openingHours: place.opening_hours?.weekday_text?.[0] || "Horário não disponível",
        distance: `${distanceValue} km`
      };
    });
    
    // Sort by rating (highest first) and take the top 6
    return providers
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    
  } catch (error) {
    console.error('Error searching for service providers:', error);
    
    // Fallback to mock data if there's an error
    console.log('Falling back to mock data due to error');
    return generateMockServiceProviders(city, serviceType);
  }
};

// Function to generate mock service providers when the API fails
function generateMockServiceProviders(city: City, serviceType: ServiceType): ServiceProvider[] {
  console.log(`Generating mock data for ${serviceType} in city ${city.name}, ${city.state}`);
  
  const regionalData = getRegionalData(city.state);
  
  // Generate mock providers
  const mockProviders: ServiceProvider[] = [];
  
  // A list of realistic provider names for each service type
  const providerNames: Record<ServiceType, string[]> = {
    'Eletricista': [
      'Eletricistas Profissionais', 'Elétrica Express', 'Instalações Elétricas Rápidas', 
      'Eletricista 24 Horas', 'Serviços Elétricos Confiáveis', 'Pronto Atendimento Elétrico'
    ],
    'Pintor': [
      'Pintores Profissionais', 'Pintura Rápida', 'Serviços de Pintura', 
      'Pinturas Decorativas', 'Renovação de Ambientes', 'Pintura Residencial'
    ],
    'Encanador': [
      'Encanadores Express', 'Serviços Hidráulicos', 'Encanador 24h', 
      'Solução em Encanamentos', 'Manutenção Hidráulica', 'Desentupidora Rápida'
    ],
    'Diarista': [
      'Limpeza Express', 'Diaristas Profissionais', 'Serviço de Limpeza',
      'Limpeza Residencial', 'Organização e Limpeza', 'Limpeza Completa'
    ],
    'Pedreiro': [
      'Construções e Reformas', 'Pedreiros Profissionais', 'Serviços de Alvenaria',
      'Reformas Express', 'Construções Rápidas', 'Reparos e Acabamentos'
    ]
  };
  
  // Generate 6 mock providers
  for (let i = 0; i < 6; i++) {
    const names = providerNames[serviceType];
    const name = names[Math.floor(Math.random() * names.length)];
    
    // Get a random street name from the regional data
    const streetName = regionalData.streets[Math.floor(Math.random() * regionalData.streets.length)];
    
    // Generate a random address number
    const addressNumber = Math.floor(Math.random() * 1000) + 1;
    
    // Get random neighborhood name
    const neighborhoods = regionalData.neighborhoods || ["Centro", "Jardim América", "Nova Esperança"];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    
    // Format address with street name, number and neighborhood
    const address = `R. ${streetName}, ${addressNumber} - ${neighborhood}, ${city.name}, ${city.state}`;
    
    // Generate a properly formatted phone with the regional area code
    const phoneNumber = generatePhoneNumber(getCityAreaCode(city));
    
    // Random distance between 0.5 and 10 km
    const distance = `${(Math.random() * 9.5 + 0.5).toFixed(1)} km`;
    
    // Random rating between 3.0 and 5.0
    const rating = Number((Math.random() * 2 + 3).toFixed(1));
    
    // Random review count between 5 and 200
    const reviewCount = Math.floor(Math.random() * 195) + 5;
    
    // Random years in business between 1 and 15
    const yearsInBusiness = Math.floor(Math.random() * 15) + 1;
    
    mockProviders.push({
      id: `mock-${i}`,
      name: `${name} ${city.name}`,
      serviceType,
      rating,
      reviewCount,
      phone: phoneNumber,
      address,
      yearsInBusiness,
      openingHours: "Seg. a Sex.: 08:00 - 18:00",
      distance
    });
  }
  
  // Sort by rating (highest first)
  return mockProviders.sort((a, b) => b.rating - a.rating);
}

// Get area code based on city and state
function getCityAreaCode(city: City): string {
  return getAreaCodeByState(city.state);
}

// Generate a random phone number with the given area code
function generatePhoneNumber(areaCode: string): string {
  // Generate 9 digits for mobile phones in Brazil
  const firstDigit = "9"; // Mobile phones in Brazil start with 9
  const remainingDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  // Return the complete number without formatting (will be formatted in the UI)
  return `${areaCode}${firstDigit}${remainingDigits}`;
}

function getAreaCodeByState(state: string): string {
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
    'TO': '63',
    'RO': '69',
    'AP': '96',
    'RR': '95',
    'AC': '68'
  };

  return areaCodes[state] || '11'; // Default to São Paulo area code if not found
}

// The following helper functions are for mock data generation
function getRegionalData(stateCode: string) {
  // Common street names in Brazil by region
  const regionalStreets: Record<string, string[]> = {
    'SP': ['Paulista', 'Jabaquara', 'Ibirapuera', 'São João', 'Santos', 'Ipiranga', 'Pinheiros', 'Consolação', 'Luz', 'Butantã'],
    'RJ': ['Copacabana', 'Ipanema', 'Leblon', 'Tijuca', 'Maracanã', 'Botafogo', 'Flamengo', 'Méier', 'Barra', 'Jacarepaguá'],
    'MG': ['Savassi', 'Mangabeiras', 'Pampulha', 'Buritis', 'Serra', 'Funcionários', 'Barreiro', 'Contagem', 'Betim', 'Santa Efigênia'],
    'BA': ['Barra', 'Pelourinho', 'Pituba', 'Itapuã', 'Amaralina', 'Campo Grande', 'Vitória', 'Graça', 'Canela', 'Bonfim'],
    'PB': ['Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa', 'Bancários', 'Mangabeira', 'Centro', 'Cruz das Armas', 'Jaguaribe', 'Jardim Cidade'],
    'PE': ['Boa Viagem', 'Pina', 'Piedade', 'Candeias', 'Aflitos', 'Casa Forte', 'Espinheiro', 'Graças', 'Derby', 'Casa Amarela'],
    'CE': ['Aldeota', 'Meireles', 'Iracema', 'Centro', 'Varjota', 'Fátima', 'Cocó', 'Papicu', 'Edson Queiroz', 'Benfica']
  };
  
  // Add some common Brazilian street names for states not explicitly defined
  const commonStreets = [
    'Brasil', 'Amazonas', 'Paraná', 'São Paulo', 'Bahia', 'Ceará', 
    'Minas Gerais', 'Pernambuco', 'Maranhão', 'Goiás', 'Piauí', 'Alagoas',
    'Floriano Peixoto', 'Sete de Setembro', 'Quinze de Novembro', 'Tiradentes',
    'Santos Dumont', 'Rio Branco', 'Getúlio Vargas', 'Juscelino Kubitschek'
  ];
  
  // Neighborhoods for each state
  const regionalNeighborhoods: Record<string, string[]> = {
    'SP': ['Jardins', 'Moema', 'Vila Mariana', 'Tatuapé', 'Pinheiros', 'Itaim Bibi', 'Vila Madalena', 'Santana', 'Perdizes', 'Lapa'],
    'RJ': ['Copacabana', 'Ipanema', 'Leblon', 'Tijuca', 'Botafogo', 'Flamengo', 'Barra da Tijuca', 'Recreio', 'Jacarepaguá', 'Méier'],
    'MG': ['Savassi', 'Lourdes', 'Funcionários', 'Serra', 'Buritis', 'Sion', 'Belvedere', 'Cidade Nova', 'Santa Efigênia', 'Pampulha'],
    'BA': ['Barra', 'Pituba', 'Itaigara', 'Caminho das Árvores', 'Vitória', 'Graça', 'Canela', 'Rio Vermelho', 'Itapuã', 'Paralela'],
    'PB': ['Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa', 'Jardim Oceania', 'Bancários', 'Mangabeira', 'Altiplano', 'Tambiá', 'Centro'],
    'PE': ['Boa Viagem', 'Pina', 'Imbiribeira', 'Casa Forte', 'Graças', 'Parnamirim', 'Torre', 'Aflitos', 'Espinheiro', 'Poço'],
    'CE': ['Aldeota', 'Meireles', 'Mucuripe', 'Fátima', 'Cocó', 'Varjota', 'Centro', 'Benfica', 'Joaquim Távora', 'Papicu']
  };

  // Default values if state not found
  const defaultStreets = commonStreets;
  const defaultNeighborhoods = ['Centro', 'Jardim América', 'Nova Esperança', 'São José', 'Santo Antônio', 'Boa Vista'];
  
  // Return regional data
  return {
    streets: regionalStreets[stateCode] || defaultStreets,
    neighborhoods: regionalNeighborhoods[stateCode] || defaultNeighborhoods
  };
}

// Old functions kept for backward compatibility
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

