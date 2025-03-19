
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
    
    // Create the API URL (using Google Places API)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=pt-BR&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    // Make the request to Google Places API (in a real app, this would be done via a backend service)
    // For now, we'll continue to use mock data but structured to mimic the expected response
    console.log('Would request:', url);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate realistic mock service providers that simulate Google Places data
    const mockProviders: ServiceProvider[] = Array.from({ length: 6 }, (_, i) => {
      // Generate realistic business names based on service type
      const businessNames = {
        'Eletricista': ['Elétrica Express', 'Serviços Elétricos Silva', 'Eletricistas Unidos', 'Instalações Elétricas JC', 'Eletricista 24h', 'Rede Elétrica'],
        'Pintor': ['Pintores Profissionais', 'Cores & Cia', 'Pintura Expressa', 'Tintas & Arte', 'Renovação Pinturas', 'Pincel de Ouro'],
        'Encanador': ['Hidroserv', 'Encanadores Express', 'Água & Cia', 'Tubos & Conexões', 'Hidráulica Geral', 'Vazamentos Zero'],
        'Diarista': ['Limpeza Express', 'Faxina Completa', 'Casa & Cia Limpezas', 'Diaristas Profissionais', 'Limpeza Total', 'Serviços Domésticos'],
        'Pedreiro': ['Construções Silva', 'Reformas Express', 'Alvenaria Profissional', 'Obras & Cia', 'Construções Rápidas', 'Mão de Obra Especializada']
      };
      
      // Generate realistic ratings between 3.5 and 5.0
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const reviews = Math.floor(Math.random() * 100) + 10;
      const yearsInBusiness = Math.floor(Math.random() * 15) + 1;
      
      // Generate random distance between 0.5 and 10 km, with closer distances being more likely
      // Use exponential distribution to favor closer distances
      const distanceValue = (0.5 + Math.exp(Math.random() * 1.5)).toFixed(1);
      
      return {
        id: `place-${i}-${serviceType}-${cep}`,
        name: businessNames[serviceType][i],
        serviceType,
        rating: parseFloat(rating),
        reviewCount: reviews,
        phone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `R. ${['Brasil', 'São José', 'Flores', 'Palmeiras', 'Santos', 'Ipiranga'][i]}, ${Math.floor(Math.random() * 1000) + 100} - Próximo ao CEP ${cep}`,
        yearsInBusiness,
        openingHours: `${Math.floor(Math.random() * 3) + 7}h às ${Math.floor(Math.random() * 4) + 17}h`,
        distance: `${distanceValue} km`
      };
    });
    
    // Sort by distance (closest first)
    return mockProviders.sort((a, b) => {
      const distanceA = parseFloat(a.distance.split(' ')[0]);
      const distanceB = parseFloat(b.distance.split(' ')[0]);
      return distanceA - distanceB;
    });
    
  } catch (error) {
    console.error('Error searching for service providers:', error);
    throw new Error('Falha ao buscar prestadores de serviço. Por favor, tente novamente.');
  }
};
