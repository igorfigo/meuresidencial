
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceProvider } from '@/types/serviceProvider';
import { Star, Phone, Clock, MapPin, Award } from 'lucide-react';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export const ServiceProviderCard = ({ provider }: ServiceProviderCardProps) => {
  const handleCall = () => {
    // In a real app, this would track the call or initiate it
    window.open(`tel:${provider.phone.replace(/\D/g, '')}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{provider.name}</h3>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{provider.rating}</span>
              <span className="text-muted-foreground text-sm ml-1">
                ({provider.reviewCount} avaliações)
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <Award className="h-4 w-4 mr-2 mt-0.5 text-slate-500" />
              <span>{provider.yearsInBusiness} {provider.yearsInBusiness === 1 ? 'ano' : 'anos'} no mercado</span>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 text-slate-500" />
              <span>Horário: {provider.openingHours}</span>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-500" />
              <span className="break-words">{provider.address} • {provider.distance}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-6">
        <Button 
          onClick={handleCall} 
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          <Phone className="h-4 w-4" />
          {provider.phone}
        </Button>
      </CardFooter>
    </Card>
  );
};
