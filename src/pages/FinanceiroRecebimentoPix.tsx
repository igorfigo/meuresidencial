
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2, QrCode } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from '@/components/ui/separator';
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
import { useApp } from '@/contexts/AppContext';
import { getPixKey, savePixKey, deletePixKey } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface PixKeyFormData {
  matricula: string;
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
  created_at?: string;
  updated_at?: string;
}

const FinanceiroRecebimentoPix = () => {
  const { user } = useApp();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pixKey, setPixKey] = useState<PixKeyFormData | null>(null);
  
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
    if (user?.selectedCondominium) {
      loadPixKey();
    }
  }, [user?.selectedCondominium]);
  
  const loadPixKey = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      setIsLoading(true);
      const data = await getPixKey(user.selectedCondominium);
      
      if (data) {
        setPixKey(data);
        form.reset({
          matricula: data.matricula,
          tipochave: data.tipochave,
          chavepix: data.chavepix,
          diavencimento: data.diavencimento || '10',
          jurosaodia: data.jurosaodia || '0.033',
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        setPixKey(null);
      }
    } catch (error) {
      console.error('Error loading PIX key:', error);
      toast.error('Erro ao carregar chave PIX');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: PixKeyFormData) => {
    if (!user?.selectedCondominium) return;
    
    try {
      const isValid = validatePixKey(data.tipochave, data.chavepix);
      if (!isValid) {
        return;
      }
      
      data.matricula = user.selectedCondominium;
      
      await savePixKey(data);
      toast.success(pixKey ? 'Chave PIX atualizada com sucesso' : 'Chave PIX cadastrada com sucesso');
      loadPixKey();
      setIsEditing(false);
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
  
  const handleDelete = async () => {
    if (!user?.selectedCondominium) return;
    
    try {
      await deletePixKey(user.selectedCondominium);
      toast.success('Chave PIX excluída com sucesso');
      form.reset({
        tipochave: 'CPF',
        chavepix: '',
        diavencimento: '10',
        jurosaodia: '0.033',
      });
      setPixKey(null);
    } catch (error) {
      console.error('Error deleting PIX key:', error);
      toast.error('Erro ao excluir chave PIX');
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (pixKey) {
      form.reset({
        matricula: pixKey.matricula,
        tipochave: pixKey.tipochave,
        chavepix: pixKey.chavepix,
        diavencimento: pixKey.diavencimento || '10',
        jurosaodia: pixKey.jurosaodia || '0.033',
        created_at: pixKey.created_at,
        updated_at: pixKey.updated_at,
      });
    } else {
      form.reset({
        tipochave: 'CPF',
        chavepix: '',
        diavencimento: '10',
        jurosaodia: '0.033',
      });
    }
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
        return 100; // Reasonable max for email
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
  
  return (
    <DashboardLayout>
      <div className={`container mx-auto ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start mb-3">
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Recebimento PIX / Juros</h1>
            <p className="text-gray-500 text-sm">Configure as informações da chave PIX e juros para recebimento de pagamentos.</p>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        <Card className="bg-white shadow-md border-t-4 border-t-brand-600">
          <CardHeader className={`bg-blue-50 border-b border-blue-100 ${isMobile ? 'px-3 py-3' : 'p-4'}`}>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-medium flex items-center`}>
                  <QrCode className="mr-2 h-4 w-4 text-blue-500" />
                  Dados da Chave PIX e Juros
                </CardTitle>
                {!isMobile && (
                  <CardDescription>
                    Configure a chave PIX para recebimento de pagamentos do condomínio
                  </CardDescription>
                )}
              </div>
              
              {!isLoading && pixKey && !isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size={isMobile ? "sm" : "default"} className={isMobile ? "px-2 py-1 text-xs" : ""} onClick={handleEdit}>
                    <Pencil className={`${isMobile ? "h-3 w-3" : "mr-1 h-3 w-3"}`} />
                    {!isMobile && "Editar"}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? "px-2 py-1 text-xs" : ""} bg-red-50 border-red-200 text-red-600 hover:bg-red-100`}
                      >
                        <Trash2 className={`${isMobile ? "h-3 w-3" : "mr-1 h-3 w-3"}`} />
                        {!isMobile && "Excluir"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={isMobile ? "max-w-[95%] p-3" : ""}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Chave PIX</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta chave PIX? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              
              {!isLoading && !pixKey && !isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  size={isMobile ? "sm" : "default"}
                  className={isMobile ? "text-xs" : ""}
                >
                  <PlusCircle className={`${isMobile ? "h-3 w-3 mr-1" : "mr-2 h-4 w-4"}`} />
                  Cadastrar Chave PIX
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className={`${isMobile ? 'p-3' : 'pt-6'}`}>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="tipochave"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required className={isMobile ? "text-sm" : ""}>Tipo da Chave</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className={isMobile ? "h-8 text-sm" : ""}>
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
                          <FormLabel required className={isMobile ? "text-sm" : ""}>Chave PIX</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={isMobile ? "h-8 text-sm" : ""}
                              placeholder={getChavePixPlaceholder(watchTipoChave)}
                              type={getChavePixInputType(watchTipoChave)}
                              maxLength={getChavePixMaxLength(watchTipoChave)}
                              numberOnly={['CPF', 'CNPJ', 'TELEFONE'].includes(watchTipoChave)}
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
                          <FormLabel required className={isMobile ? "text-sm" : ""}>Dia de Vencimento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={isMobile ? "h-8 text-sm" : ""}
                              type="number"
                              min="1"
                              max="31"
                              placeholder="10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jurosaodia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required className={isMobile ? "text-sm" : ""}>Juros ao Dia (%)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={isMobile ? "h-8 text-sm" : ""}
                              placeholder="0.033"
                            />
                          </FormControl>
                          {!isMobile && (
                            <p className="text-xs text-gray-500">Exemplo: 0.033 para uma taxa de 0,033% ao dia</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel} 
                      size={isMobile ? "sm" : "default"}
                      className={isMobile ? "text-xs" : ""}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={form.formState.isSubmitting}
                      size={isMobile ? "sm" : "default"}
                      className={isMobile ? "text-xs" : ""}
                    >
                      {form.formState.isSubmitting ? 'Salvando...' : pixKey ? 'Salvar Alterações' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : pixKey ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 mb-1`}>Tipo da Chave</h3>
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>{pixKey.tipochave}</p>
                  </div>
                  
                  <div>
                    <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 mb-1`}>Chave PIX</h3>
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>{pixKey.chavepix}</p>
                  </div>
                  
                  <div>
                    <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 mb-1`}>Dia de Vencimento</h3>
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>{pixKey.diavencimento || '10'}</p>
                  </div>
                  
                  <div>
                    <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 mb-1`}>Juros ao Dia</h3>
                    <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>{pixKey.jurosaodia || '0.033'}%</p>
                  </div>
                </div>
                
                {!isMobile && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
                    <p className="text-sm text-blue-700">
                      <strong>Importante:</strong> Esta chave PIX será utilizada para receber os pagamentos dos moradores. 
                      Certifique-se de que as informações estão corretas.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <QrCode className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-2`}>Nenhuma chave PIX cadastrada</h3>
                <p className="text-gray-500 mb-3 text-sm">
                  Para receber pagamentos via PIX, cadastre uma chave PIX para o condomínio.
                </p>
                <Button 
                  onClick={() => setIsEditing(true)}
                  size={isMobile ? "sm" : "default"}
                  className={isMobile ? "text-xs" : ""}
                >
                  <PlusCircle className={`${isMobile ? "h-3 w-3 mr-1" : "mr-2 h-4 w-4"}`} />
                  Cadastrar Chave PIX
                </Button>
              </div>
            )}
          </CardContent>
          
          {!isLoading && pixKey && !isEditing && (
            <CardFooter className={`bg-gray-50 border-t border-gray-100 ${isMobile ? 'px-3 py-2' : ''}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                Última atualização: {new Date(pixKey.updated_at || pixKey.created_at || new Date()).toLocaleDateString('pt-BR')}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroRecebimentoPix;
