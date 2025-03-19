
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
    
    // Generate realistic mock service providers that simulate Google Places data
    const mockProviders: ServiceProvider[] = Array.from({ length: 10 }, (_, i) => {
      // Generate realistic business names based on service type
      const businessNames = {
        'Eletricista': ['Elétrica Express', 'Serviços Elétricos Silva', 'Eletricistas Unidos', 'Instalações Elétricas JC', 'Eletricista 24h', 'Rede Elétrica', 'Força & Luz', 'Eletrotécnica BR', 'Ligações Elétricas', 'Elétrica Doméstica'],
        'Pintor': ['Pintores Profissionais', 'Cores & Cia', 'Pintura Expressa', 'Tintas & Arte', 'Renovação Pinturas', 'Pincel de Ouro', 'Pintura Residencial', 'Arte em Cores', 'Pintura Comercial', 'Pintura Decorativa'],
        'Encanador': ['Hidroserv', 'Encanadores Express', 'Água & Cia', 'Tubos & Conexões', 'Hidráulica Geral', 'Vazamentos Zero', 'Encanação Profissional', 'Reparo Hidráulico', 'Água Fácil', 'Canos & Cia'],
        'Diarista': ['Limpeza Express', 'Faxina Completa', 'Casa & Cia Limpezas', 'Diaristas Profissionais', 'Limpeza Total', 'Serviços Domésticos', 'Limpeza Perfeita', 'Limpeza Residencial', 'Faxina Rápida', 'Limpeza Geral'],
        'Pedreiro': ['Construções Silva', 'Reformas Express', 'Alvenaria Profissional', 'Obras & Cia', 'Construções Rápidas', 'Mão de Obra Especializada', 'Reforma Geral', 'Construção Civil', 'Mestre de Obras', 'Reformas & Reparos']
      };
      
      // Generate realistic ratings between 3.0 and 5.0
      const rating = (3.0 + Math.random() * 2.0).toFixed(1);
      const reviews = Math.floor(Math.random() * 150) + 5;
      const yearsInBusiness = Math.floor(Math.random() * 15) + 1;
      
      // Generate random distance between 0.5 and 15 km, with a higher probability of being within 10km
      const distanceValue = (0.5 + Math.random() * 14.5).toFixed(1);
      
      return {
        id: `place-${i}-${serviceType}-${cep}`,
        name: businessNames[serviceType][i],
        serviceType,
        rating: parseFloat(rating),
        reviewCount: reviews,
        phone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `R. ${['Brasil', 'São José', 'Flores', 'Palmeiras', 'Santos', 'Ipiranga', 'Amazonas', 'Paraná', 'São Paulo', 'Bahia'][i]}, ${Math.floor(Math.random() * 1000) + 100} - Próximo ao CEP ${cep}`,
        yearsInBusiness,
        openingHours: `${Math.floor(Math.random() * 3) + 7}h às ${Math.floor(Math.random() * 4) + 17}h`,
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
