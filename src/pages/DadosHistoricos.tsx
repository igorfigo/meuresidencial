
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, History, ChevronLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalDataPixSection } from '@/components/pix/HistoricalDataPixSection';

const DadosHistoricos = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'inclusao' // Default to 'inclusao', could be 'download'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is a manager (not admin and not resident)
  if (user?.isAdmin || user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 max-w-7xl">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2`}>Dados Históricos</h1>
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const typeText = formData.type === 'inclusao' ? 'Solicitação de Inclusão de Históricos' : 'Solicitação de Download de Históricos';
      
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.nome || 'Nome não informado',
          email: user?.email || 'Email não informado',
          matricula: user?.matricula || 'N/A',
          nomeCondominio: user?.nomeCondominio || 'N/A',
          subject: `[${typeText}] ${formData.subject}`,
          message: formData.message
        }
      });
      
      if (error) throw error;
      
      toast.success('Solicitação enviada com sucesso! Responderemos em até 24 horas úteis.');
      setFormData({ subject: '', message: '', type: 'inclusao' });
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-2 max-w-7xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>Dados Históricos</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </div>
        <Separator className="mb-4" />
        
        <div className="grid grid-cols-1 gap-6">
          {/* PIX Payment Section - Full width */}
          {user?.matricula && (
            <div className="w-full">
              <HistoricalDataPixSection 
                matricula={user.matricula}
                className="w-full"
              />
            </div>
          )}
          
          <Card className="border-t-4 border-t-brand-600 shadow-md w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-brand-700">
                Solicitar Dados Históricos
              </CardTitle>
              <CardDescription className="text-gray-600">
                Preencha o formulário abaixo para solicitar a inclusão ou download de dados históricos do seu condomínio.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="font-medium text-sm">Nome</Label>
                      <Input 
                        id="nome" 
                        value={user?.nome || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium text-sm">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || 'Não informado'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="matricula" className="font-medium text-sm">Matrícula</Label>
                      <Input 
                        id="matricula" 
                        value={user?.matricula || 'N/A'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="condominio" className="font-medium text-sm">Condomínio</Label>
                      <Input 
                        id="condominio" 
                        value={user?.nomeCondominio || 'N/A'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-medium text-sm" required>Assunto</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      placeholder="Digite o assunto da solicitação" 
                      required 
                      className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-medium text-sm" required>Mensagem</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      placeholder="Descreva os dados históricos que deseja incluir ou baixar do sistema..." 
                      rows={6}
                      required 
                      className="border-gray-300 focus:border-brand-500 focus:ring-brand-500 resize-none"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">Informações Importantes</h4>
                        <p className="mt-1 text-sm text-blue-700">
                          Após o pagamento, nossa equipe processará sua solicitação de dados históricos em até 3 dias úteis.
                          O serviço tem valor único de R$ 249,00.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-end pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-brand-600 hover:bg-brand-700 transition-colors"
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
      </div>
    </DashboardLayout>
  );
};

export default DadosHistoricos;
