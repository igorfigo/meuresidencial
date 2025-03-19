
import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// List of Brazilian cities with states - Extended list
const brazilianCities = [
  // Capitais
  { name: 'São Paulo', state: 'SP' },
  { name: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Brasília', state: 'DF' },
  { name: 'Salvador', state: 'BA' },
  { name: 'Fortaleza', state: 'CE' },
  { name: 'Belo Horizonte', state: 'MG' },
  { name: 'Manaus', state: 'AM' },
  { name: 'Curitiba', state: 'PR' },
  { name: 'Recife', state: 'PE' },
  { name: 'Porto Alegre', state: 'RS' },
  { name: 'Belém', state: 'PA' },
  { name: 'Goiânia', state: 'GO' },
  { name: 'Teresina', state: 'PI' },
  { name: 'Natal', state: 'RN' },
  { name: 'Campo Grande', state: 'MS' },
  { name: 'João Pessoa', state: 'PB' },
  { name: 'Maceió', state: 'AL' },
  { name: 'Aracaju', state: 'SE' },
  { name: 'Cuiabá', state: 'MT' },
  { name: 'Porto Velho', state: 'RO' },
  { name: 'Florianópolis', state: 'SC' },
  { name: 'Macapá', state: 'AP' },
  { name: 'Rio Branco', state: 'AC' },
  { name: 'Vitória', state: 'ES' },
  { name: 'Palmas', state: 'TO' },
  { name: 'Boa Vista', state: 'RR' },

  // Cidades importantes de SP
  { name: 'Guarulhos', state: 'SP' },
  { name: 'Campinas', state: 'SP' },
  { name: 'São Bernardo do Campo', state: 'SP' },
  { name: 'Santo André', state: 'SP' },
  { name: 'Osasco', state: 'SP' },
  { name: 'Ribeirão Preto', state: 'SP' },
  { name: 'Sorocaba', state: 'SP' },
  { name: 'São José dos Campos', state: 'SP' },
  { name: 'Santos', state: 'SP' },
  { name: 'Mauá', state: 'SP' },
  { name: 'São José do Rio Preto', state: 'SP' },
  { name: 'Piracicaba', state: 'SP' },
  { name: 'Jundiaí', state: 'SP' },
  { name: 'Carapicuíba', state: 'SP' },
  { name: 'Bauru', state: 'SP' },
  { name: 'Limeira', state: 'SP' },
  { name: 'Franca', state: 'SP' },
  { name: 'Taubaté', state: 'SP' },

  // Cidades importantes do RJ
  { name: 'São Gonçalo', state: 'RJ' },
  { name: 'Duque de Caxias', state: 'RJ' },
  { name: 'Nova Iguaçu', state: 'RJ' },
  { name: 'Niterói', state: 'RJ' },
  { name: 'Belford Roxo', state: 'RJ' },
  { name: 'Campos dos Goytacazes', state: 'RJ' },
  { name: 'São João de Meriti', state: 'RJ' },
  { name: 'Petrópolis', state: 'RJ' },
  { name: 'Volta Redonda', state: 'RJ' },
  { name: 'Magé', state: 'RJ' },

  // Cidades importantes de MG
  { name: 'Uberlândia', state: 'MG' },
  { name: 'Contagem', state: 'MG' },
  { name: 'Juiz de Fora', state: 'MG' },
  { name: 'Betim', state: 'MG' },
  { name: 'Montes Claros', state: 'MG' },
  { name: 'Ribeirão das Neves', state: 'MG' },
  { name: 'Uberaba', state: 'MG' },
  { name: 'Governador Valadares', state: 'MG' },
  { name: 'Ipatinga', state: 'MG' },
  { name: 'Sete Lagoas', state: 'MG' },
  { name: 'Divinópolis', state: 'MG' },
  { name: 'Santa Luzia', state: 'MG' },
  { name: 'Ibirité', state: 'MG' },
  { name: 'Poços de Caldas', state: 'MG' },
  { name: 'Patos de Minas', state: 'MG' },
  { name: 'Pouso Alegre', state: 'MG' },
  { name: 'Teófilo Otoni', state: 'MG' },
  { name: 'Barbacena', state: 'MG' },
  { name: 'Sabará', state: 'MG' },
  { name: 'Varginha', state: 'MG' },

  // Cidades importantes da BA
  { name: 'Feira de Santana', state: 'BA' },
  { name: 'Vitória da Conquista', state: 'BA' },
  { name: 'Camaçari', state: 'BA' },
  { name: 'Itabuna', state: 'BA' },
  { name: 'Juazeiro', state: 'BA' },
  { name: 'Ilhéus', state: 'BA' },
  { name: 'Lauro de Freitas', state: 'BA' },
  { name: 'Jequié', state: 'BA' },

  // Cidades importantes do CE
  { name: 'Caucaia', state: 'CE' },
  { name: 'Juazeiro do Norte', state: 'CE' },
  { name: 'Maracanaú', state: 'CE' },
  { name: 'Sobral', state: 'CE' },
  { name: 'Crato', state: 'CE' },
  { name: 'Itapipoca', state: 'CE' },

  // Cidades importantes de PE
  { name: 'Jaboatão dos Guararapes', state: 'PE' },
  { name: 'Olinda', state: 'PE' },
  { name: 'Caruaru', state: 'PE' },
  { name: 'Petrolina', state: 'PE' },
  { name: 'Paulista', state: 'PE' },
  { name: 'Cabo de Santo Agostinho', state: 'PE' },
  { name: 'Camaragibe', state: 'PE' },

  // Cidades importantes do PR
  { name: 'Londrina', state: 'PR' },
  { name: 'Maringá', state: 'PR' },
  { name: 'Ponta Grossa', state: 'PR' },
  { name: 'Cascavel', state: 'PR' },
  { name: 'São José dos Pinhais', state: 'PR' },
  { name: 'Foz do Iguaçu', state: 'PR' },
  { name: 'Colombo', state: 'PR' },
  { name: 'Guarapuava', state: 'PR' },

  // Cidades importantes do RS
  { name: 'Caxias do Sul', state: 'RS' },
  { name: 'Pelotas', state: 'RS' },
  { name: 'Canoas', state: 'RS' },
  { name: 'Santa Maria', state: 'RS' },
  { name: 'Gravataí', state: 'RS' },
  { name: 'Viamão', state: 'RS' },
  { name: 'Novo Hamburgo', state: 'RS' },
  { name: 'São Leopoldo', state: 'RS' },
  { name: 'Rio Grande', state: 'RS' },
  { name: 'Alvorada', state: 'RS' },
  { name: 'Passo Fundo', state: 'RS' },

  // Cidades importantes de SC
  { name: 'Joinville', state: 'SC' },
  { name: 'Blumenau', state: 'SC' },
  { name: 'São José', state: 'SC' },
  { name: 'Chapecó', state: 'SC' },
  { name: 'Itajaí', state: 'SC' },
  { name: 'Criciúma', state: 'SC' },
  { name: 'Jaraguá do Sul', state: 'SC' },
  { name: 'Palhoça', state: 'SC' },
  { name: 'Lages', state: 'SC' },
  { name: 'Balneário Camboriú', state: 'SC' },

  // Cidades importantes do GO
  { name: 'Aparecida de Goiânia', state: 'GO' },
  { name: 'Anápolis', state: 'GO' },
  { name: 'Rio Verde', state: 'GO' },
  { name: 'Luziânia', state: 'GO' },
  { name: 'Águas Lindas de Goiás', state: 'GO' },
  { name: 'Valparaíso de Goiás', state: 'GO' },
  { name: 'Trindade', state: 'GO' },
  
  // Cidades importantes do PA
  { name: 'Ananindeua', state: 'PA' },
  { name: 'Santarém', state: 'PA' },
  { name: 'Marabá', state: 'PA' },
  { name: 'Castanhal', state: 'PA' },
  { name: 'Parauapebas', state: 'PA' },
  { name: 'Cametá', state: 'PA' },
  
  // Cidades importantes do MA
  { name: 'São Luís', state: 'MA' },
  { name: 'Imperatriz', state: 'MA' },
  { name: 'Timon', state: 'MA' },
  { name: 'Caxias', state: 'MA' },
  { name: 'Codó', state: 'MA' },
  { name: 'Paço do Lumiar', state: 'MA' },
  
  // Cidades importantes do AM
  { name: 'Parintins', state: 'AM' },
  { name: 'Itacoatiara', state: 'AM' },
  { name: 'Manacapuru', state: 'AM' },
  { name: 'Coari', state: 'AM' },
  { name: 'Tefé', state: 'AM' },
  
  // Cidades importantes do ES
  { name: 'Vila Velha', state: 'ES' },
  { name: 'Serra', state: 'ES' },
  { name: 'Cariacica', state: 'ES' },
  { name: 'Cachoeiro de Itapemirim', state: 'ES' },
  { name: 'Linhares', state: 'ES' },
  { name: 'São Mateus', state: 'ES' },
  { name: 'Guarapari', state: 'ES' },
  { name: 'Colatina', state: 'ES' },
  
  // Cidades importantes do PB
  { name: 'Campina Grande', state: 'PB' },
  { name: 'Santa Rita', state: 'PB' },
  { name: 'Patos', state: 'PB' },
  { name: 'Bayeux', state: 'PB' },
  { name: 'Sousa', state: 'PB' },
  { name: 'Cajazeiras', state: 'PB' },
  
  // Ordenando em ordem alfabética
].sort((a, b) => {
  return a.name.localeCompare(b.name, 'pt-BR');
});

export type City = {
  name: string;
  state: string;
};

interface CityAutocompleteProps {
  selectedCity: City | null;
  onCityChange: (city: City | null) => void;
}

export const CityAutocomplete = ({ selectedCity, onCityChange }: CityAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>(brazilianCities);

  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredCities(brazilianCities);
      return;
    }

    const normalized = searchValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const filtered = brazilianCities.filter(city => {
      const cityName = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cityState = city.state.toLowerCase();
      return cityName.includes(normalized) || cityState.includes(normalized);
    });
    
    setFilteredCities(filtered);
  }, [searchValue]);

  const handleSelect = (city: City) => {
    onCityChange(city);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 py-2"
        >
          {selectedCity ? (
            <span className="flex items-center">
              {selectedCity.name}, {selectedCity.state}
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione uma cidade</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="rounded-md border">
          <div className="flex items-center border-b px-3">
            <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Digite o nome da cidade..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCities.length === 0 ? (
              <div className="py-6 text-center text-sm">Nenhuma cidade encontrada.</div>
            ) : (
              <div className="overflow-hidden p-1 text-foreground">
                {filteredCities.map((city) => (
                  <div
                    key={`${city.name}-${city.state}`}
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      selectedCity?.name === city.name && selectedCity?.state === city.state && "bg-accent text-accent-foreground"
                    )}
                  >
                    <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                    {city.name}, {city.state}
                    {selectedCity?.name === city.name && selectedCity?.state === city.state && (
                      <Check className="ml-auto h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
