
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
import { Loader2, Send, History } from 'lucide-react';
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (type: 'inclusao' | 'download') => {
    setFormData(prev => ({ ...prev, type }));
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
      
      // Inserir na tabela historical_data_requests
      const { error: insertError } = await supabase
        .from('historical_data_requests')
        .insert({
          matricula: user?.matricula,
          condominium_name: user?.nomeCondominio,
          manager_name: user?.nome,
          manager_email: user?.email,
          request_type: formData.type,
          subject: `${typeText} - ${formData.subject}`,
          message: formData.message,
          payment_status: 'pending',
          status: 'new'
        })
        .select();
      
      if (insertError) {
        console.error('Erro ao inserir dados:', insertError);
        throw insertError;
      }
      
      // Enviar e-mail através da edge function
      await sendEmailNotification({
        name: user?.nome || '',
        email: user?.email || '',
        matricula: user?.matricula || '',
        nomeCondominio: user?.nomeCondominio || '',
        subject: `${typeText} - ${formData.subject}`,
        message: formData.message,
        isHistoricalData: true
      });
      
      toast.success('Solicitação cadastrada com sucesso! Em breve entraremos em contato.');
      setFormData({ subject: '', message: '', type: 'inclusao' });
    } catch (error) {
      console.error('Erro ao cadastrar solicitação:', error);
      toast.error('Erro ao cadastrar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para enviar e-mail de notificação usando a edge function existente
  const sendEmailNotification = async (data: {
    name: string;
    email: string;
    matricula: string;
    nomeCondominio: string;
    subject: string;
    message: string;
    isHistoricalData: boolean;
  }) => {
    try {
      const response = await fetch(
        'https://kcbvdcacgbwigefwacrk.supabase.co/functions/v1/send-contact-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao enviar e-mail: ${errorData.error || 'Erro desconhecido'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar e-mail de notificação:', error);
      // Não exibimos toast aqui, pois queremos que a solicitação seja salva mesmo se o e-mail falhar
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
                  <Label htmlFor="type" className="font-medium">Tipo de Solicitação</Label>
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
                    <Label htmlFor="nome" className="font-medium">Nome</Label>
                    <Input 
                      id="nome" 
                      value={user?.nome || 'Não informado'} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || 'Não informado'} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="font-medium">Matrícula</Label>
                    <Input 
                      id="matricula" 
                      value={user?.matricula || 'N/A'} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condominio" className="font-medium">Condomínio</Label>
                    <Input 
                      id="condominio" 
                      value={user?.nomeCondominio || 'N/A'} 
                      disabled 
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-medium" required>Assunto</Label>
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
                  <Label htmlFor="message" className="font-medium" required>Mensagem</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder={formData.type === 'inclusao' 
                      ? "Descreva os dados históricos que deseja incluir no sistema..." 
                      : "Descreva os dados históricos que deseja baixar do sistema..."} 
                    rows={6} 
                    required 
                    className="border-gray-300 focus:border-brand-500 focus:ring-brand-500 resize-none"
                  />
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
