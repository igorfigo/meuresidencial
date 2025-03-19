
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceProvider } from '@/types/serviceProvider';
import { Star, Phone, Clock, MapPin, Award, Check, Store, ExternalLink, Navigation, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export const ServiceProviderCard = ({ provider }: ServiceProviderCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  
  // Format phone number for Brazilian format (XX) XXXXX-XXXX
  const formatBrazilianPhone = (phone: string): string => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Make sure we have enough digits
    if (digits.length < 10) return phone;
    
    // Format according to Brazilian standard
    const areaCode = digits.substring(0, 2);
    
    // Check if it's a mobile number (has 9 as first digit after area code)
    if (digits.length === 11) {
      // Mobile number format: (XX) XXXXX-XXXX
      const firstPart = digits.substring(2, 7);
      const secondPart = digits.substring(7);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    } else {
      // Landline format: (XX) XXXX-XXXX
      const firstPart = digits.substring(2, 6);
      const secondPart = digits.substring(6);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    }
  };
  
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(provider.phone);
    setCopied(true);
    
    toast({
      title: "Número copiado",
      description: `O número ${formatBrazilianPhone(provider.phone)} foi copiado para a área de transferência.`
    });
    
    // Reset copy state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Generate a random testimonial quote based on the provider's service type
  const getTestimonial = () => {
    const testimonials = {
      'Eletricista': [
        "Muito competente e especialista nos serviços elétricos em geral.",
        "Profissional competente, pontual, educado, atencioso. Excelente nota 10!",
        "Excelente eletricista, pontual e honesto.",
        "Vieram super rápido, profissional resolutivo e competente."
      ],
      'Pintor': [
        "Trabalho de qualidade e acabamento impecável.",
        "Profissional cuidadoso e atencioso aos detalhes.",
        "Ótimo pintor, recomendo a todos.",
        "Trabalho limpo e organizado, resultado excelente."
      ],
      'Encanador': [
        "Resolveu o problema rapidamente e com eficiência.",
        "Profissional experiente e que entende do assunto.",
        "Atendimento rápido e serviço de qualidade.",
        "Ótimo custo-benefício e serviço bem feito."
      ],
      'Diarista': [
        "Limpeza impecável e muito organizada.",
        "Profissional de confiança e muito caprichosa.",
        "Atenciosa aos detalhes e muito educada.",
        "Trabalho excelente, casa ficou impecável."
      ],
      'Pedreiro': [
        "Trabalho de qualidade e bom acabamento.",
        "Profissional experiente e que cumpre prazos.",
        "Construção sólida e bem feita.",
        "Honesto e trabalho de excelente qualidade."
      ]
    };
    
    // Use provider id as seed to ensure consistent testimonial for the same provider
    const seed = parseInt(provider.id.replace(/\D/g, '').substring(0, 5), 16);
    const options = testimonials[provider.serviceType] || [];
    const index = seed % options.length;
    
    return `"${options[index]}"`;
  };

  // Get formatted phone without the country code for display
  const getFormattedPhone = () => {
    return formatBrazilianPhone(provider.phone);
  };
  
  // Get last 4 digits of phone for display in the call button
  const getLastDigits = () => {
    const digits = provider.phone.replace(/\D/g, '');
    return digits.substring(digits.length - 4);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header with Store Icon and Badge */}
      <div className="relative bg-blue-500 h-24 flex items-center justify-center">
        <Store className="h-12 w-12 text-white" />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Muito Confiável
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg">{provider.name}</h3>
            <div className="mt-1 flex items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 mr-2">
                {provider.serviceType}
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm italic mt-2">{getTestimonial()}</p>
            
            <div className="flex items-center mt-3">
              <div className="flex">
                {[...Array(Math.floor(provider.rating))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
                {provider.rating % 1 > 0 && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 opacity-50" />
                )}
              </div>
              <span className="text-sm text-gray-500 ml-1">
                ({provider.reviewCount})
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <Award className="h-4 w-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
              <span>Mais de {provider.yearsInBusiness} {provider.yearsInBusiness === 1 ? 'ano' : 'anos'} no mercado{provider.address.includes(",") ? ` • ${provider.address.split(",")[0]}` : ""}</span>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
              <span>{provider.openingHours.includes("Horário não disponível") ? "Aberto 24 horas" : provider.openingHours}</span>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-4 w-4 mr-2 mt-0.5 text-slate-500 flex-shrink-0" />
              <span>{getFormattedPhone()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col space-y-2 pt-0 pb-4">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-1"
            onClick={() => {
              toast({
                title: "Site",
                description: "Esta funcionalidade não está disponível no momento."
              });
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Site</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-1"
            onClick={() => {
              toast({
                title: "Como chegar",
                description: "Esta funcionalidade não está disponível no momento."
              });
            }}
          >
            <Navigation className="h-4 w-4" />
            <span>Como chegar</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            onClick={handleCopyPhone} 
            className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600"
          >
            <Phone className="h-4 w-4" />
            <span>Ligar</span>
          </Button>
          
          <Button 
            className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600"
            onClick={() => {
              toast({
                title: "WhatsApp",
                description: "Esta funcionalidade não está disponível no momento."
              });
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
