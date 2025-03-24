
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

interface PixKeyFormData {
  id?: string;
  tipochave: string;
  chavepix: string;
  diavencimento: string;
  jurosaodia: string;
}

const FinanceiroRecebimentoPix = () => {
  const { user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pixKey, setPixKey] = useState<PixKeyFormData | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PixKeyFormData>({
    defaultValues: {
      tipochave: 'CPF',
      chavepix: '',
      diavencimento: '10',
      jurosaodia: '0.033',
    }
  });
  
  useEffect(() => {
    loadPixKey();
  }, []);
  
  const loadPixKey = async () => {
    try {
      setIsLoading(true);
      const data = await getPixKey();
      
      if (data) {
        setPixKey(data);
        reset({
          id: data.id,
          tipochave: data.tipochave,
          chavepix: data.chavepix,
          diavencimento: data.diavencimento || '10',
          jurosaodia: data.jurosaodia || '0.033',
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
    try {
      await savePixKey(data);
      toast.success(pixKey ? 'Chave PIX atualizada com sucesso' : 'Chave PIX cadastrada com sucesso');
      loadPixKey();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving PIX key:', error);
      toast.error('Erro ao salvar chave PIX');
    }
  };
  
  const handleDelete = async () => {
    if (!pixKey?.id) return;
    
    try {
      await deletePixKey(pixKey.id);
      toast.success('Chave PIX excluída com sucesso');
      reset({
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
      reset({
        id: pixKey.id,
        tipochave: pixKey.tipochave,
        chavepix: pixKey.chavepix,
        diavencimento: pixKey.diavencimento || '10',
        jurosaodia: pixKey.jurosaodia || '0.033',
      });
    } else {
      reset({
        tipochave: 'CPF',
        chavepix: '',
        diavencimento: '10',
        jurosaodia: '0.033',
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Recebimento PIX</h1>
            <p className="text-gray-500">Configure as informações da chave PIX para recebimento de pagamentos.</p>
          </div>
        </div>
        
        <Card className="bg-white shadow-md border-blue-100">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-medium flex items-center">
                  <QrCode className="mr-2 h-5 w-5 text-blue-500" />
                  Dados da Chave PIX
                </CardTitle>
                <CardDescription>
                  Configure a chave PIX para recebimento de pagamentos do condomínio
                </CardDescription>
              </div>
              
              {!isLoading && pixKey && !isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEdit}>
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
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              
              {!isLoading && !pixKey && !isEditing && (
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
                <Skeleton className="h-10 w-full" />
              </div>
            ) : isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipochave">Tipo da Chave</Label>
                    <Select 
                      defaultValue={pixKey?.tipochave || "CPF"}
                      onValueChange={(value) => setValue('tipochave', value)}
                    >
                      <SelectTrigger id="tipochave">
                        <SelectValue placeholder="Selecione o tipo de chave" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="EMAIL">E-mail</SelectItem>
                        <SelectItem value="TELEFONE">Telefone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chavepix">Chave PIX</Label>
                    <Input 
                      id="chavepix"
                      {...register('chavepix', { required: "A chave PIX é obrigatória" })}
                      placeholder="Digite a chave PIX"
                    />
                    {errors.chavepix && (
                      <p className="text-sm text-red-500">{errors.chavepix.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="diavencimento">Dia de Vencimento</Label>
                    <Input 
                      id="diavencimento"
                      type="number"
                      min="1"
                      max="31"
                      {...register('diavencimento', { 
                        required: "O dia de vencimento é obrigatório",
                        min: { value: 1, message: "O dia deve ser entre 1 e 31" },
                        max: { value: 31, message: "O dia deve ser entre 1 e 31" }
                      })}
                      placeholder="10"
                    />
                    {errors.diavencimento && (
                      <p className="text-sm text-red-500">{errors.diavencimento.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jurosaodia">Juros ao Dia (%)</Label>
                    <Input 
                      id="jurosaodia"
                      {...register('jurosaodia', { 
                        required: "O valor de juros é obrigatório",
                        pattern: {
                          value: /^[0-9]*\.?[0-9]*$/,
                          message: "Informe um valor numérico válido"
                        }
                      })}
                      placeholder="0.033"
                    />
                    {errors.jurosaodia && (
                      <p className="text-sm text-red-500">{errors.jurosaodia.message}</p>
                    )}
                    <p className="text-xs text-gray-500">Exemplo: 0.033 para uma taxa de 0,033% ao dia</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : pixKey ? 'Salvar Alterações' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            ) : pixKey ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo da Chave</h3>
                    <p className="text-base font-medium">{pixKey.tipochave}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Chave PIX</h3>
                    <p className="text-base font-medium">{pixKey.chavepix}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Dia de Vencimento</h3>
                    <p className="text-base font-medium">{pixKey.diavencimento || '10'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Juros ao Dia</h3>
                    <p className="text-base font-medium">{pixKey.jurosaodia || '0.033'}%</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
                  <p className="text-sm text-blue-700">
                    <strong>Importante:</strong> Esta chave PIX será utilizada para receber os pagamentos dos moradores. 
                    Certifique-se de que as informações estão corretas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <QrCode className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma chave PIX cadastrada</h3>
                <p className="text-gray-500 mb-4">
                  Para receber pagamentos via PIX, cadastre uma chave PIX para o condomínio.
                </p>
                <Button onClick={() => setIsEditing(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Chave PIX
                </Button>
              </div>
            )}
          </CardContent>
          
          {!isLoading && pixKey && !isEditing && (
            <CardFooter className="bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date(pixKey.created_at).toLocaleDateString('pt-BR')}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinanceiroRecebimentoPix;
