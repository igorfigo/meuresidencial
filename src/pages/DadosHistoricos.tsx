
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, History, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalDataPixSection } from '@/components/pix/HistoricalDataPixSection';

const DadosHistoricos = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    type: 'inclusao' // Default to 'inclusao', could be 'download'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  
  // Check if user is a manager (not admin and not resident)
  if (user?.isAdmin || user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Dados Históricos</h1>
          <Separator className="mb-4" />
          <Card className="border-t-4 border-t-amber-500 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <History className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">
                    Esta funcionalidade está disponível apenas para gestores de condomínio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get existing requests when component mounts
  useEffect(() => {
    const checkExistingRequests = async () => {
      if (!user?.matricula) return;
      
      try {
        const { data, error } = await supabase
          .from('historical_data_requests')
          .select('created_at')
          .eq('matricula', user.matricula)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Erro ao verificar solicitações anteriores:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setLastSubmission(new Date(data[0].created_at));
        }
      } catch (error) {
        console.error('Erro ao verificar solicitações:', error);
      }
    };
    
    checkExistingRequests();
  }, [user?.matricula]);
  
  const handleTypeChange = (type: 'inclusao' | 'download') => {
    setFormData(prev => ({ ...prev, type }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!user) {
        toast.error('Usuário não autenticado. Por favor, faça login novamente.');
        return;
      }
      
      // Inserção direta na tabela
      const { error } = await supabase
        .from('historical_data_requests')
        .insert({
          matricula: user.matricula || '',
          condominium_name: user.nomeCondominio || 'Nome não informado',
          manager_name: user.nome || 'Nome não informado',
          manager_email: user.email || 'Email não informado',
          request_type: formData.type,
        });
      
      if (error) {
        console.error('Erro detalhado:', error);
        
        // Fornece mensagens de erro mais específicas com base no tipo de erro
        if (error.code === '23505') { // Violação de chave única
          toast.error('Você já possui uma solicitação similar em processamento.');
        } else if (error.code === '42501') { // Violação de permissão
          toast.error('Você não tem permissão para realizar esta ação.');
        } else {
          toast.error(`Erro ao enviar solicitação: ${error.message}`);
        }
        return;
      }
      
      toast.success('Solicitação enviada com sucesso! Responderemos em até 24 horas úteis.');
      setLastSubmission(new Date());
      setFormData({ type: 'inclusao' });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Dados Históricos</h1>
        <Separator className="mb-2" />
        <p className="text-gray-600 mb-6">
          Solicite a inclusão ou download de dados históricos para o seu condomínio.
        </p>
        
        {/* PIX Payment Section */}
        {user?.matricula && <HistoricalDataPixSection matricula={user.matricula} />}
        
        {lastSubmission && (
          <Card className="border-t-4 border-t-green-500 shadow-md mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Info className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-2">Solicitação em Andamento</h3>
                  <p className="text-gray-600">
                    Você já tem uma solicitação enviada em {lastSubmission.toLocaleDateString('pt-BR')}. 
                    Nossa equipe irá analisar e entrar em contato em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-t-4 border-t-brand-600 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-brand-700">Envie sua solicitação</CardTitle>
            <CardDescription className="text-gray-600">
              Após o envio da sua solicitação, você receberá um formulário com todos os dados do seu sistema, ou um formulário para preenchimento com todos os dados para inclusão no sistema.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Tipo de Solicitação</h3>
                  <div className="flex space-x-4 mt-2">
                    <Button
                      type="button"
                      variant={formData.type === 'inclusao' ? 'default' : 'outline'}
                      className={formData.type === 'inclusao' ? 'bg-brand-600 hover:bg-brand-700' : ''}
                      onClick={() => handleTypeChange('inclusao')}
                    >
                      Inclusão de Históricos
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'download' ? 'default' : 'outline'}
                      className={formData.type === 'download' ? 'bg-brand-600 hover:bg-brand-700' : ''}
                      onClick={() => handleTypeChange('download')}
                    >
                      Download de Históricos
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Nome</h3>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      {user?.nome || 'Não informado'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Email</h3>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      {user?.email || 'Não informado'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Matrícula</h3>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      {user?.matricula || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Condomínio</h3>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      {user?.nomeCondominio || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-end gap-4'} pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className={`${isMobile ? 'w-full' : ''} border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
            >
              Voltar
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${isMobile ? 'w-full' : ''} bg-brand-600 hover:bg-brand-700 transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DadosHistoricos;
