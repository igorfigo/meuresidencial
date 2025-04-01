
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchMatriculaProps {
  matriculaSearch: string;
  onMatriculaChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export const SearchMatricula = ({
  matriculaSearch,
  onMatriculaChange,
  onSearch,
  isSearching
}: SearchMatriculaProps) => {
  // Handle matricula input to only allow numbers
  const handleMatriculaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    onMatriculaChange(numericValue);
  };
  
  // Handle matricula key press to prevent non-numeric input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numeric input
    const isNumber = /^[0-9]$/i.test(e.key);
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key);
    
    if (!isNumber && !isControlKey) {
      e.preventDefault();
    }
  };

  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="matriculaSearch">Buscar por Matrícula</Label>
          <div className="flex space-x-2 mt-1">
            <Input 
              id="matriculaSearch" 
              placeholder="Digite a matrícula para buscar" 
              value={matriculaSearch}
              onChange={handleMatriculaInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1"
              inputMode="numeric"
              numberOnly
            />
            <Button 
              type="button" 
              onClick={onSearch} 
              disabled={isSearching} 
              className="bg-brand-600 hover:bg-brand-700">
              {isSearching ? "Buscando..." : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
