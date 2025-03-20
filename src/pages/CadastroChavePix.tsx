
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, KeyRound, Trash } from 'lucide-react';
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

type FormFields = {
  id?: string;
  tipoChave: string;
  chavePix: string;
};

interface PixKey {
  id: string;
  tipoChave: string;
  chavePix: string;
  created_at: string;
}

export const CadastroChavePix = () => {
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);

  const form = useForm<FormFields>({
    defaultValues: {
      tipoChave: '',
      chavePix: ''
    }
  });

  const { reset, handleSubmit, setValue, watch } = form;
  const tipoChave = watch('tipoChave');

  const fetchPixKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .select('*')
        .order('created_at', { ascending: false }) as { data: PixKey[] | null, error: any };

      if (error) throw error;
      
      setPixKeys(data || []);
    } catch (error) {
      console.error('Erro ao carregar chaves PIX:', error);
      toast.error('Erro ao carregar a lista de chaves PIX.');
    }
  };

  useEffect(() => {
    fetchPixKeys();
  }, []);

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

    setIsSubmitting(true);
    try {
      const formData = {
        tipoChave: data.tipoChave,
        chavePix: data.chavePix
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
        reset();
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
      tipoChave: pixKey.tipoChave,
      chavePix: pixKey.chavePix
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
        fetchPixKeys();
        
        if (form.getValues().id === id) {
          reset({
            tipoChave: '',
            chavePix: ''
          });
          setIsExistingRecord(false);
        }
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
            <h1 className="text-3xl font-bold">Cadastro Chave PIX</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie as chaves PIX disponíveis para recebimento.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">{isExistingRecord ? 'Editar Chave PIX' : 'Nova Chave PIX'}</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoChave">Tipo da Chave</Label>
                  <Select
                    onValueChange={(value) => setValue('tipoChave', value)}
                    defaultValue={form.getValues().tipoChave}
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
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !tipoChave}
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : (isExistingRecord ? 'Atualizar Chave PIX' : 'Salvar Chave PIX')}
                </Button>
              </form>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chaves PIX Cadastradas</h2>
              <ScrollArea className="h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Chave PIX</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pixKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Nenhuma chave PIX cadastrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pixKeys.map((pixKey) => (
                        <TableRow key={pixKey.id}>
                          <TableCell className="font-medium">{pixKey.tipoChave}</TableCell>
                          <TableCell>{pixKey.chavePix}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditPixKey(pixKey)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeletePixKey(pixKey.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CadastroChavePix;
