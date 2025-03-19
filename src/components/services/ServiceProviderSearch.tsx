
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceProvider, ServiceType } from '@/types/serviceProvider';
import { searchServiceProviders } from '@/services/serviceProviderService';
import { formatCep, validateCep } from '@/services/cepService';
import { ServiceProviderCard } from './ServiceProviderCard';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const ServiceProviderSearch = () => {
  const [cep, setCep] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setCep(formattedCep);
  };

  const handleSearch = async () => {
    if (!cep || !serviceType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o CEP e selecione um tipo de serviço.",
        variant: "destructive"
      });
      return;
    }

    if (!validateCep(cep)) {
      toast({
        title: "CEP inválido",
        description: "Por favor, insira um CEP válido com 8 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await searchServiceProviders(cep, serviceType as ServiceType);
      setProviders(results);
    } catch (error) {
      console.error('Error searching for providers:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar prestadores de serviço. Tente novamente.",
        variant: "destructive"
      });
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="cep" className="block text-sm font-medium mb-1">
            CEP
          </label>
          <Input
            id="cep"
            placeholder="Digite o CEP"
            value={cep}
            onChange={handleCepChange}
            maxLength={9}
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
      
      {hasSearched && (
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : providers.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-4">
                Prestadores de serviço encontrados ({providers.length})
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
                Nenhum prestador de serviço encontrado para esta busca.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
