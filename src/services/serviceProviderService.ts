
import { ServiceProvider, ServiceType } from '@/types/serviceProvider';

// This would normally connect to an API, but for demonstration we'll generate mock data
export const searchServiceProviders = async (
  cep: string, 
  serviceType: ServiceType
): Promise<ServiceProvider[]> => {
  console.log(`Searching for ${serviceType} providers in CEP: ${cep}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate 6 mock service providers
  const mockProviders: ServiceProvider[] = Array.from({ length: 6 }, (_, i) => {
    const rating = (4 + Math.random()).toFixed(1);
    const reviews = Math.floor(Math.random() * 100) + 10;
    const yearsInBusiness = Math.floor(Math.random() * 15) + 1;
    // Generate random distance between 0.5 and 10 km
    const distance = (Math.random() * 9.5 + 0.5).toFixed(1);
    
    return {
      id: `provider-${i}-${serviceType}-${cep}`,
      name: `${serviceType} ${['Profissional', 'Especialista', 'Soluções', 'Express', 'Premium', '24h'][i]}`,
      serviceType,
      rating: parseFloat(rating),
      reviewCount: reviews,
      phone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
      address: `Próximo ao CEP ${cep}`,
      yearsInBusiness,
      openingHours: `${Math.floor(Math.random() * 3) + 7}h às ${Math.floor(Math.random() * 4) + 17}h`,
      distance: `${distance} km`
    };
  });
  
  // Sort by distance (closest first)
  return mockProviders.sort((a, b) => {
    const distanceA = parseFloat(a.distance.split(' ')[0]);
    const distanceB = parseFloat(b.distance.split(' ')[0]);
    return distanceA - distanceB;
  });
};
