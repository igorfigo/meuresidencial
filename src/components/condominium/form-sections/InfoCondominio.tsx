
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { fetchAddressByCep } from '@/services/cepService';
import { toast } from 'sonner';
import type { FormFields } from '@/hooks/use-condominium-form';

interface InfoCondominioProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InfoCondominio = ({ handleInputChange }: InfoCondominioProps) => {
  const { register, watch, setValue } = useFormContext<FormFields>();
  const [isLoadingCep, setIsLoadingCep] = React.useState(false);

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
            Este campo é gerado automaticamente após preencher CEP e Número.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register('cnpj')}
            onChange={handleInputChange}
            placeholder="00.000.000/0001-00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <div className="flex space-x-2">
            <Input
              id="cep"
              {...register('cep')}
              onChange={handleInputChange}
              placeholder="00000-000"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleCepSearch}
              disabled={isLoadingCep}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {isLoadingCep ? "Buscando..." : <Search className="h-4 w-4" />}
            </Button>
          </div>
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
            onChange={handleInputChange}
            placeholder="Número"
          />
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
