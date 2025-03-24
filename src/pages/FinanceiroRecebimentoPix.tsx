
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRound, Edit, Trash, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FormFields = {
  id?: string;
  tipoChave: string;
  chavePix: string;
  diaVencimento: string;
  jurosAoDia: string;
};

interface PixKey {
  id: string;
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
  created_at: string;
}

export const FinanceiroRecebimentoPix = () => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);

  const form = useForm<FormFields>({
    defaultValues: {
      tipoChave: '',
      chavePix: '',
      diaVencimento: '10',
      jurosAoDia: '0.033'
    }
  });

  const { reset, handleSubmit, setValue, watch } = form;
  const tipoChave = watch('tipoChave');

  const fetchPixKeys = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('pix_keys')
        .select('*')
        .order('created_at', { ascending: false }) as { data: PixKey[] | null, error: any };

      if (error) throw error;
      
      const keys = data || [];
      setPixKeys(keys);
      
      // If a key exists, load it into the form
      if (keys.length > 0) {
        const pixKey = keys[0];
        reset({
          id: pixKey.id,
          tipoChave: pixKey.tipochave,
          chavePix: pixKey.chavepix,
          diaVencimento: pixKey.diavencimento || '10',
          jurosAoDia: pixKey.jurosaodia || '0.033'
        });
        setIsExistingRecord(true);
      }
    } catch (error) {
      console.error('Erro ao carregar chave PIX:', error);
      toast.error('Erro ao carregar a chave PIX.');
    }
  };

  useEffect(() => {
    fetchPixKeys();
  }, [user]);

  const validatePixKey = (value: string, type: string): boolean => {
    switch (type) {
      case 'CPF':
        return /^\d{11}$/.test(value);
      case 'CNPJ':
        return /^\d{14}$/.test(value);
      case 'EMAIL':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'TELEFONE':
        // Accepts format with or without country code
        return /^\+?\d{10,14}$/.test(value);
      default:
        return true;
    }
  };

  const validateNumericField = (value: string, fieldName: string): boolean => {
    // For due day, allow only numbers between 1 and 31
    if (fieldName === 'diaVencimento') {
      const day = parseInt(value);
      return !isNaN(day) && day >= 1 && day <= 31;
    }
    
    // For interest rate, allow decimal numbers (percentage per day)
    if (fieldName === 'jurosAoDia') {
      const rate = parseFloat(value);
      return !isNaN(rate) && rate >= 0;
    }
    
    return true;
  };

  const onSubmit = async (data: FormFields) => {
    if (!validatePixKey(data.chavePix, data.tipoChave)) {
      let errorMessage = 'Formato de chave PIX inválido.';
      
      if (data.tipoChave === 'CPF') {
        errorMessage = 'CPF deve conter exatamente 11 dígitos numéricos.';
      } else if (data.tipoChave === 'CNPJ') {
        errorMessage = 'CNPJ deve conter exatamente 14 dígitos numéricos.';
      } else if (data.tipoChave === 'EMAIL') {
        errorMessage = 'Email inválido.';
      } else if (data.tipoChave === 'TELEFONE') {
        errorMessage = 'Telefone deve conter entre 10 e 14 dígitos numéricos.';
      }
      
      toast.error(errorMessage);
      return;
    }

    if (!validateNumericField(data.diaVencimento, 'diaVencimento')) {
      toast.error('Dia de vencimento deve ser um número entre 1 e 31.');
      return;
    }

    if (!validateNumericField(data.jurosAoDia, 'jurosAoDia')) {
      toast.error('Juros ao dia deve ser um número válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Map our form field names to the database column names
      const formData = {
        tipochave: data.tipoChave,
        chavepix: data.chavePix,
        diavencimento: data.diaVencimento,
        jurosaodia: data.jurosAoDia
      };
      
      if (isExistingRecord && data.id) {
        const { error } = await supabase
          .from('pix_keys')
          .update(formData)
          .eq('id', data.id) as { error: any };

        if (error) throw error;
        toast.success('Chave PIX atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('pix_keys')
          .insert(formData) as { error: any };

        if (error) throw error;
        toast.success('Chave PIX cadastrada com sucesso!');
      }
      
      fetchPixKeys();
    } catch (error) {
      console.error('Erro ao salvar chave PIX:', error);
      toast.error('Erro ao salvar chave PIX. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPixKey = (pixKey: PixKey) => {
    reset({
      id: pixKey.id,
      tipoChave: pixKey.tipochave,
      chavePix: pixKey.chavepix,
      diaVencimento: pixKey.diavencimento || '10',
      jurosAoDia: pixKey.jurosaodia || '0.033'
    });
    setIsExistingRecord(true);
  };

  const handleDeletePixKey = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta chave PIX?')) {
      try {
        const { error } = await supabase
          .from('pix_keys')
          .delete()
          .eq('id', id) as { error: any };
        
        if (error) throw error;
        
        toast.success('Chave PIX excluída com sucesso!');
        reset({
          tipoChave: '',
          chavePix: '',
          diaVencimento: '10',
          jurosAoDia: '0.033'
        });
        setIsExistingRecord(false);
        fetchPixKeys();
      } catch (error) {
        console.error('Erro ao excluir chave PIX:', error);
        toast.error('Erro ao excluir chave PIX.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center">
            <KeyRound className="h-6 w-6 mr-2 text-brand-600" />
            <h1 className="text-3xl font-bold">Recebimento PIX</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cadastre a chave PIX para recebimento dos valores do condomínio, além de informações sobre vencimento e juros.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 h-full border-t-4 border-t-brand-600 shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">{isExistingRecord ? 'Editar Chave PIX' : 'Nova Chave PIX'}</h2>
              
              <div className="space-y-2">
                <Label htmlFor="tipoChave">Tipo da Chave</Label>
                <Select
                  onValueChange={(value) => setValue('tipoChave', value)}
                  defaultValue={form.getValues().tipoChave}
                  value={form.getValues().tipoChave}
                >
                  <SelectTrigger id="tipoChave">
                    <SelectValue placeholder="Selecione o tipo de chave" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="TELEFONE">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input
                  id="chavePix"
                  placeholder={
                    tipoChave === 'CPF' ? '12345678901' :
                    tipoChave === 'CNPJ' ? '12345678901234' :
                    tipoChave === 'EMAIL' ? 'email@exemplo.com' :
                    tipoChave === 'TELEFONE' ? '11987654321' :
                    'Digite a chave PIX'
                  }
                  {...form.register('chavePix', { required: true })}
                  onKeyDown={(e) => {
                    // Allow only numbers for CPF, CNPJ and TELEFONE
                    if ((tipoChave === 'CPF' || tipoChave === 'CNPJ' || tipoChave === 'TELEFONE') && 
                        !/^\d$/.test(e.key) && 
                        e.key !== 'Backspace' && 
                        e.key !== 'Delete' && 
                        e.key !== 'ArrowLeft' && 
                        e.key !== 'ArrowRight' && 
                        e.key !== 'Tab' && 
                        !e.ctrlKey && 
                        !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {tipoChave === 'CPF' && 'Digite apenas os 11 dígitos numéricos do CPF.'}
                  {tipoChave === 'CNPJ' && 'Digite apenas os 14 dígitos numéricos do CNPJ.'}
                  {tipoChave === 'EMAIL' && 'Digite um email válido.'}
                  {tipoChave === 'TELEFONE' && 'Digite apenas números do telefone com DDD.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                <Input
                  id="diaVencimento"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="10"
                  {...form.register('diaVencimento', { required: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Dia do mês para vencimento das taxas condominiais (1-31).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurosAoDia">Juros ao Dia (%)</Label>
                <Input
                  id="jurosAoDia"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.033"
                  {...form.register('jurosAoDia', { required: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Percentual de juros aplicado por dia de atraso (ex: 0.033 para 0,033% ao dia).
                </p>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !tipoChave}
                  className="flex-1 bg-brand-600 hover:bg-brand-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : (isExistingRecord ? 'Atualizar Chave PIX' : 'Salvar Chave PIX')}
                </Button>
                
                {isExistingRecord && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => handleDeletePixKey(form.getValues().id as string)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
            </form>
          </Card>
          
          <Card className="p-6 h-full border-t-4 border-t-brand-600 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Chave PIX Cadastrada</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Chave PIX</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Juros/Dia (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pixKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Nenhuma chave PIX cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  pixKeys.map((pixKey) => (
                    <TableRow key={pixKey.id}>
                      <TableCell className="font-medium">{pixKey.tipochave}</TableCell>
                      <TableCell>{pixKey.chavepix}</TableCell>
                      <TableCell>Dia {pixKey.diavencimento || '10'}</TableCell>
                      <TableCell>{pixKey.jurosaodia || '0.033'}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Apenas uma chave PIX pode ser cadastrada por condomínio. Para alterar as informações, 
                utilize o formulário ao lado.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroRecebimentoPix;
