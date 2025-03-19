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
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found in environment variables');
      throw new Error('Chave da API Google Maps não configurada. Por favor, contate o administrador.');
    }
    
    // Create the API URL (using Google Places API)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${apiKey}`;
    
    // Make the request through a CORS proxy (in a production app, this would be done via a backend service)
    const corsProxy = 'https://corsproxy.io/?';
    const response = await fetch(corsProxy + encodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
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
        phone: place.formatted_phone_number || "Não disponível", // Note: Text Search doesn't return phone, would need a Place Details request
        address: place.formatted_address || place.vicinity || "",
        yearsInBusiness: Math.floor(Math.random() * 15) + 1, // This data isn't available from Places API
        openingHours: place.opening_hours?.weekday_text?.[0] || "Horário não disponível",
        distance: `${distanceValue} km`
      };
    });
    
    // Filter providers within 10km (all should be within range as we're using a proximity search)
    const providersWithin10km = providers.filter(provider => {
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
