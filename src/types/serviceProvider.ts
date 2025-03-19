
export type ServiceType = 'Eletricista' | 'Pintor' | 'Encanador' | 'Diarista' | 'Pedreiro';

export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: ServiceType;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  yearsInBusiness: number;
  openingHours: string;
  distance: string;
}
