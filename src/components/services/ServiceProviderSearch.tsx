
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ServiceProvider, ServiceType } from '@/types/serviceProvider';
import { searchServiceProviders } from '@/services/serviceProviderService';
import { ServiceProviderCard } from './ServiceProviderCard';
import { Search, Loader2, MapPin, AlertCircle, Star, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CityAutocomplete, City } from './CityAutocomplete';

export const ServiceProviderSearch = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState<City | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    setError(null);
    
    if (!selectedCity || !serviceType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma cidade e um tipo de serviço.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSearchedCity(selectedCity);
    setProviders([]);

    try {
      const results = await searchServiceProviders(selectedCity, serviceType as ServiceType);
      setProviders(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: `Não encontramos prestadores para esta busca em ${selectedCity.name}-${selectedCity.state}. Tente outra cidade ou tipo de serviço.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Busca concluída",
          description: `Encontramos ${results.length} prestadores de serviço em ${selectedCity.name}-${selectedCity.state}, ordenados pelas melhores avaliações.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error searching for providers:', error);
      setError((error as Error).message || "Ocorreu um erro ao buscar prestadores de serviço. Tente novamente.");
      toast({
        title: "Erro na busca",
        description: (error as Error).message || "Ocorreu um erro ao buscar prestadores de serviço. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            Cidade
          </label>
          <CityAutocomplete 
            selectedCity={selectedCity} 
            onCityChange={setSelectedCity} 
          />
        </div>
        
        <div>
          <label htmlFor="service-type" className="block text-sm font-medium mb-1">
            Tipo de Serviço
          </label>
          <Select
            value={serviceType}
            onValueChange={(value) => setServiceType(value as ServiceType)}
          >
            <SelectTrigger id="service-type">
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Eletricista">Eletricista</SelectItem>
              <SelectItem value="Pintor">Pintor</SelectItem>
              <SelectItem value="Encanador">Encanador</SelectItem>
              <SelectItem value="Diarista">Diarista</SelectItem>
              <SelectItem value="Pedreiro">Pedreiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Prestadores
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na busca</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {hasSearched && !error && (
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : providers.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-brand-600" />
                Prestadores em {searchedCity?.name}-{searchedCity?.state} ({providers.length})
                <span className="ml-4 flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  Ordenados por avaliação
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => (
                  <ServiceProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-gray-500">
                Nenhum prestador de serviço encontrado em {searchedCity?.name}-{searchedCity?.state}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Informação importante */}
      <Alert className="mt-8 bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Informação importante</AlertTitle>
        <AlertDescription>
          A busca utiliza informações do Google Maps para encontrar prestadores próximos à cidade informada. 
          Recomendamos que todas as negociações e acordos sejam feitos diretamente entre as partes envolvidas.
        </AlertDescription>
      </Alert>
    </div>
  );
};
