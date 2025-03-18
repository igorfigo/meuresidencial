
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
              onChange={(e) => onMatriculaChange(e.target.value)}
              className="flex-1" 
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
