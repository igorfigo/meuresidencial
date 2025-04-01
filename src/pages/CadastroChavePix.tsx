
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2, KeyRound } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface PixKeyFormData {
  id?: string;
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
  created_at?: string;
}

interface PixKey {
  id: string;
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
  created_at: string;
}

const CadastroChavePix = () => {
  const { user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [selectedPixKey, setSelectedPixKey] = useState<PixKey | null>(null);
  const [maxKeysReached, setMaxKeysReached] = useState(false);
  
  const form = useForm<PixKeyFormData>({
    defaultValues: {
      tipochave: 'CPF',
      chavepix: '',
      diavencimento: '10',
      jurosaodia: '0.033',
    }
  });
  
  const watchTipoChave = form.watch('tipochave');
  
  useEffect(() => {
    form.setValue('chavepix', '');
  }, [watchTipoChave, form]);
  
  useEffect(() => {
    loadPixKeys();
  }, []);
  
  const loadPixKeys = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pix_key_meuresidencial')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Map the data to include diavencimento with a default value if it doesn't exist
        const mappedData: PixKey[] = data.map(item => ({
          ...item,
          diavencimento: item.diavencimento || '10', // Default to '10' if diavencimento doesn't exist
        }));
        
        setPixKeys(mappedData);
        setMaxKeysReached(mappedData.length > 0 && !isEditing);
      } else {
        setPixKeys([]);
      }
    } catch (error) {
      console.error('Error loading PIX keys:', error);
      toast.error('Erro ao carregar chaves PIX');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: PixKeyFormData) => {
    try {
      const isValid = validatePixKey(data.tipochave, data.chavepix);
      if (!isValid) {
        return;
      }
      
      // Validate dia de vencimento
      const diavencimento = parseInt(data.diavencimento);
      if (isNaN(diavencimento) || diavencimento < 1 || diavencimento > 31) {
        toast.error('Dia de vencimento deve ser um número entre 1 e 31');
        return;
      }
      
      if (isEditing && selectedPixKey?.id) {
        const { error } = await supabase
          .from('pix_key_meuresidencial')
          .update({
            tipochave: data.tipochave,
            chavepix: data.chavepix,
            diavencimento: data.diavencimento,
            jurosaodia: data.jurosaodia,
          })
          .eq('id', selectedPixKey.id);
        
        if (error) throw error;
        toast.success('Chave PIX atualizada com sucesso');
      } else {
        if (pixKeys.length > 0) {
          toast.error('Já existe uma chave PIX cadastrada. Edite a existente ou exclua-a para adicionar uma nova.');
          return;
        }
        
        const { error } = await supabase
          .from('pix_key_meuresidencial')
          .insert({
            tipochave: data.tipochave,
            chavepix: data.chavepix,
            diavencimento: data.diavencimento,
            jurosaodia: data.jurosaodia,
          });
        
        if (error) throw error;
        toast.success('Chave PIX cadastrada com sucesso');
      }
      
      loadPixKeys();
      setIsEditing(false);
      setSelectedPixKey(null);
      form.reset({
        tipochave: 'CPF',
        chavepix: '',
        diavencimento: '10',
        jurosaodia: '0.033',
      });
    } catch (error) {
      console.error('Error saving PIX key:', error);
      toast.error('Erro ao salvar chave PIX');
    }
  };
  
  const validatePixKey = (type: string, value: string): boolean => {
    switch (type) {
      case 'CPF':
        if (!/^\d{11}$/.test(value)) {
          toast.error('CPF deve conter exatamente 11 dígitos numéricos');
          return false;
        }
        break;
      case 'CNPJ':
        if (!/^\d{14}$/.test(value)) {
          toast.error('CNPJ deve conter exatamente 14 dígitos numéricos');
          return false;
        }
        break;
      case 'EMAIL':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          toast.error('Email inválido');
          return false;
        }
        break;
      case 'TELEFONE':
        if (!/^\d{11}$/.test(value)) {
          toast.error('Telefone deve conter exatamente 11 dígitos numéricos');
          return false;
        }
        break;
    }
    return true;
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pix_key_meuresidencial')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Chave PIX excluída com sucesso');
      loadPixKeys();
      setSelectedPixKey(null);
    } catch (error) {
      console.error('Error deleting PIX key:', error);
      toast.error('Erro ao excluir chave PIX');
    }
  };
  
  const handleEdit = (pixKey: PixKey) => {
    setSelectedPixKey(pixKey);
    setIsEditing(true);
    form.reset({
      tipochave: pixKey.tipochave,
      chavepix: pixKey.chavepix,
      diavencimento: pixKey.diavencimento || '10',
      jurosaodia: pixKey.jurosaodia,
    });
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPixKey(null);
    form.reset({
      tipochave: 'CPF',
      chavepix: '',
      diavencimento: '10',
      jurosaodia: '0.033',
    });
  };
  
  const getChavePixMaxLength = (tipoChave: string): number => {
    switch (tipoChave) {
      case 'CPF':
        return 11;
      case 'CNPJ':
        return 14;
      case 'TELEFONE':
        return 11;
      case 'EMAIL':
        return 100;
      default:
        return 100;
    }
  };
  
  const getChavePixInputType = (tipoChave: string): string => {
    switch (tipoChave) {
      case 'CPF':
      case 'CNPJ':
      case 'TELEFONE':
        return 'number';
      case 'EMAIL':
        return 'email';
      default:
        return 'text';
    }
  };
  
  const getChavePixPlaceholder = (tipoChave: string): string => {
    switch (tipoChave) {
      case 'CPF':
        return '12345678901';
      case 'CNPJ':
        return '12345678901234';
      case 'TELEFONE':
        return '11987654321';
      case 'EMAIL':
        return 'exemplo@email.com';
      default:
        return 'Digite a chave PIX';
    }
  };
  
  const handleJurosChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    field.onChange(value);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Cadastro Chave PIX / Juros</h1>
            <p className="text-gray-500">Cadastre e gerencie as chaves PIX disponíveis para recebimento.</p>
            <Separator className="mt-4 w-full" />
          </div>
        </div>
        
        <Card className="bg-white shadow-md border-t-4 border-t-blue-500">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-medium flex items-center">
                  <KeyRound className="mr-2 h-5 w-5 text-blue-500" />
                  Dados da Chave PIX
                </CardTitle>
                <CardDescription>
                  Configure a chave PIX para recebimento de pagamentos
                </CardDescription>
              </div>
              
              {!isLoading && selectedPixKey && !isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(selectedPixKey)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Chave PIX</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta chave PIX? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedPixKey.id)} className="bg-red-600 hover:bg-red-700">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              
              {!isLoading && pixKeys.length === 0 && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Chave PIX
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipochave"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Tipo da Chave</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de chave" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CPF">CPF</SelectItem>
                              <SelectItem value="CNPJ">CNPJ</SelectItem>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="TELEFONE">Telefone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="chavepix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Chave PIX</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={getChavePixPlaceholder(watchTipoChave)}
                              type={getChavePixInputType(watchTipoChave)}
                              maxLength={getChavePixMaxLength(watchTipoChave)}
                              onChange={(e) => {
                                if (['CPF', 'CNPJ', 'TELEFONE'].includes(watchTipoChave)) {
                                  const value = e.target.value.replace(/\D/g, '');
                                  const maxLength = getChavePixMaxLength(watchTipoChave);
                                  field.onChange(value.slice(0, maxLength));
                                } else {
                                  field.onChange(e.target.value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="diavencimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Dia de Vencimento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="31"
                              placeholder="10"
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 1 && value <= 31) {
                                  field.onChange(e.target.value);
                                } else if (e.target.value === '') {
                                  field.onChange('');
                                }
                              }}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Informe um número entre 1 e 31</p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jurosaodia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Juros ao Dia (%)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="0.033"
                              numberOnly
                              onChange={(e) => handleJurosChange(e, field)}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">Exemplo: 0.033 para uma taxa de 0,033% ao dia</p>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Salvando...' : selectedPixKey ? 'Salvar Alterações' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : pixKeys.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo da Chave</h3>
                    <p className="text-base font-medium">{pixKeys[0].tipochave}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Chave PIX</h3>
                    <p className="text-base font-medium">{pixKeys[0].chavepix}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Dia de Vencimento</h3>
                    <p className="text-base font-medium">{pixKeys[0].diavencimento || '10'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Juros ao Dia</h3>
                    <p className="text-base font-medium">{pixKeys[0].jurosaodia || '0.033'}%</p>
                  </div>
                    
                  <div className="col-span-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pixKeys[0])} className="mr-2">
                      <Pencil className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Chave PIX</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta chave PIX? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(pixKeys[0].id)} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
                  <p className="text-sm text-blue-700">
                    <strong>Importante:</strong> Esta chave PIX será utilizada para receber os pagamentos. 
                    Certifique-se de que as informações estão corretas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <KeyRound className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma chave PIX cadastrada</h3>
                <p className="text-gray-500 mb-4">
                  Para receber pagamentos via PIX, cadastre uma chave PIX.
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Chave PIX
                </Button>
              </div>
            )}
          </CardContent>
          
          {!isLoading && pixKeys.length > 0 && !isEditing && (
            <CardFooter className="bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date(pixKeys[0]?.created_at || new Date()).toLocaleDateString('pt-BR')}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CadastroChavePix;
