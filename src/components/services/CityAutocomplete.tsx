
import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// List of Brazilian cities with states
const brazilianCities = [
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
  { name: 'Guarulhos', state: 'SP' },
  { name: 'Campinas', state: 'SP' },
  { name: 'São Luís', state: 'MA' },
  { name: 'São Gonçalo', state: 'RJ' },
  { name: 'Maceió', state: 'AL' },
  { name: 'Duque de Caxias', state: 'RJ' },
  { name: 'Natal', state: 'RN' },
  { name: 'Campo Grande', state: 'MS' },
  { name: 'Teresina', state: 'PI' },
  { name: 'São Bernardo do Campo', state: 'SP' },
  { name: 'João Pessoa', state: 'PB' },
  { name: 'Nova Iguaçu', state: 'RJ' },
  { name: 'Santo André', state: 'SP' },
  { name: 'Osasco', state: 'SP' },
  { name: 'Jaboatão dos Guararapes', state: 'PE' },
  { name: 'Ribeirão Preto', state: 'SP' },
  { name: 'Uberlândia', state: 'MG' },
  { name: 'Sorocaba', state: 'SP' },
  { name: 'Niterói', state: 'RJ' },
  { name: 'Florianópolis', state: 'SC' },
  { name: 'Aracaju', state: 'SE' },
  { name: 'Cuiabá', state: 'MT' },
  { name: 'Juiz de Fora', state: 'MG' },
  { name: 'Joinville', state: 'SC' },
  { name: 'Londrina', state: 'PR' },
  { name: 'Aparecida de Goiânia', state: 'GO' },
  { name: 'Porto Velho', state: 'RO' },
  { name: 'Ananindeua', state: 'PA' },
  { name: 'Serra', state: 'ES' },
  { name: 'Caxias do Sul', state: 'RS' },
  { name: 'Macapá', state: 'AP' },
  { name: 'Vitória', state: 'ES' },
  { name: 'São José do Rio Preto', state: 'SP' },
  { name: 'Maringá', state: 'PR' },
  { name: 'Montes Claros', state: 'MG' },
  { name: 'Piracicaba', state: 'SP' },
  { name: 'Jundiaí', state: 'SP' },
  { name: 'Carapicuíba', state: 'SP' },
];

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
      return cityName.includes(normalized);
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
