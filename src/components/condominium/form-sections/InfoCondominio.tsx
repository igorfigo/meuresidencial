
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { fetchAddressByCep } from '@/services/cepService';
import { toast } from 'sonner';
import { formatCnpj } from '@/utils/currency';
import type { FormFields } from '@/hooks/use-condominium-form';

interface InfoCondominioProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExistingRecord: boolean;
}

export const InfoCondominio = ({ handleInputChange, isExistingRecord }: InfoCondominioProps) => {
  const { register, watch, setValue } = useFormContext<FormFields>();
  const [isLoadingCep, setIsLoadingCep] = React.useState(false);
  
  const cep = watch('cep');
  const numero = watch('numero');
  
  // Effect to update matricula when cep and numero change
  useEffect(() => {
    if (cep && numero) {
      const cleanCep = cep.replace(/\D/g, '');
      const cleanNumero = numero.replace(/\D/g, '');
      if (cleanCep.length > 0 && cleanNumero.length > 0) {
        setValue('matricula', `${cleanCep}${cleanNumero}`);
      }
    }
  }, [cep, numero, setValue]);

  const handleCepSearch = async () => {
    const cepValue = watch('cep');
    if (!cepValue) {
      toast.error('Por favor, digite um CEP válido.');
      return;
    }

    setIsLoadingCep(true);
    try {
      const address = await fetchAddressByCep(cepValue);
      if (address) {
        setValue('rua', address.logradouro);
        setValue('bairro', address.bairro);
        setValue('cidade', address.localidade);
        setValue('estado', address.uf);
        toast.success('CEP encontrado com sucesso!');
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
      toast.error('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const cnpjValue = value.slice(0, 14);
    const formattedCnpj = formatCnpj(cnpjValue);
    setValue('cnpj', formattedCnpj);
    if (handleInputChange) {
      const newEvent = { ...e, target: { ...e.target, value: formattedCnpj, name: 'cnpj' } };
      handleInputChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };
  
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExistingRecord) return; // Prevent editing if it's an existing record
    
    const { value } = e.target;
    
    // Only set if the value contains only numbers
    const numericValue = value.replace(/\D/g, '');
    setValue('numero', numericValue);
    
    // Update the matricula field if both CEP and numero are present
    const currentCep = watch('cep');
    if (currentCep && numericValue) {
      const cleanCep = currentCep.replace(/\D/g, '');
      if (cleanCep.length > 0) {
        setValue('matricula', `${cleanCep}${numericValue}`);
      }
    }
    
    if (handleInputChange) {
      const newEvent = { ...e, target: { ...e.target, value: numericValue, name: 'numero' } };
      handleInputChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Handle CEP input to only allow numbers
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExistingRecord) return; // Prevent editing if it's an existing record
    
    const { value } = e.target;
    
    // Only set if the value contains only numbers
    const numericValue = value.replace(/\D/g, '');
    setValue('cep', numericValue);
    
    // Update matricula if both CEP and numero are present
    const currentNumero = watch('numero');
    if (numericValue && currentNumero) {
      setValue('matricula', `${numericValue}${currentNumero}`);
    }
    
    if (handleInputChange) {
      const newEvent = { ...e, target: { ...e.target, value: numericValue, name: 'cep' } };
      handleInputChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <Card className="form-section p-6 border-t-4 border-t-brand-600 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Informações Condomínio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            {...register('matricula')}
            readOnly
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-muted-foreground">
            Este campo é gerado automaticamente combinando CEP e Número.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register('cnpj')}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0001-00"
            maxLength={18}
          />
          <p className="text-xs text-muted-foreground">
            Informe todos os 14 dígitos ou deixe em branco.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <div className="flex space-x-2">
            <Input
              id="cep"
              {...register('cep')}
              onChange={handleCepChange}
              placeholder="00000000"
              className={`flex-1 ${isExistingRecord ? 'bg-gray-100' : ''}`}
              numberOnly
              maxLength={8}
              readOnly={isExistingRecord}
              disabled={isExistingRecord}
            />
            <Button 
              type="button" 
              onClick={handleCepSearch}
              disabled={isLoadingCep || isExistingRecord}
              className={`bg-brand-600 hover:bg-brand-700 ${isExistingRecord ? 'opacity-50' : ''}`}
            >
              {isLoadingCep ? "Buscando..." : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {isExistingRecord && (
            <p className="text-xs text-amber-600">
              CEP não pode ser editado em um cadastro existente.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomeCondominio">Nome do Condomínio</Label>
          <Input
            id="nomeCondominio"
            {...register('nomeCondominio')}
            onChange={handleInputChange}
            placeholder="Nome do Condomínio"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rua">Rua</Label>
          <Input
            id="rua"
            {...register('rua')}
            onChange={handleInputChange}
            placeholder="Rua / Avenida"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            {...register('numero')}
            onChange={handleNumeroChange}
            placeholder="Número"
            numberOnly
            maxLength={10}
            className={isExistingRecord ? 'bg-gray-100' : ''}
            readOnly={isExistingRecord}
            disabled={isExistingRecord}
          />
          {isExistingRecord && (
            <p className="text-xs text-amber-600">
              Número não pode ser editado em um cadastro existente.
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            {...register('complemento')}
            onChange={handleInputChange}
            placeholder="Complemento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            {...register('bairro')}
            onChange={handleInputChange}
            placeholder="Bairro"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            {...register('cidade')}
            onChange={handleInputChange}
            placeholder="Cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            {...register('estado')}
            onChange={handleInputChange}
            placeholder="Estado"
          />
        </div>
      </div>
    </Card>
  );
};
