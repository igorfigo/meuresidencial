
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
import { Loader2, Send, History, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalDataPixSection } from '@/components/pix/HistoricalDataPixSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <div className="container mx-auto py-4 px-2 sm:px-6 max-w-3xl">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-3 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
          
          <h1 className="text-2xl font-bold mb-2">Dados Históricos</h1>
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
      <div className="container mx-auto py-4 px-2 sm:px-6 max-w-3xl">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-3 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        )}
        
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2`}>Dados Históricos</h1>
        <Separator className="mb-2" />
        <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
          Solicite a inclusão ou download de dados históricos para o seu condomínio.
        </p>
        
        {/* PIX Payment Section */}
        {user?.matricula && (
          isMobile ? (
            <Accordion type="single" collapsible className="mb-4">
              <AccordionItem value="pix-payment" className="border-b-0">
                <AccordionTrigger className="py-2 text-brand-700 font-medium">
                  Pagamento para Dados Históricos
                </AccordionTrigger>
                <AccordionContent>
                  <HistoricalDataPixSection matricula={user.matricula} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <HistoricalDataPixSection matricula={user.matricula} />
          )
        )}
        
        <Card className="border-t-4 border-t-brand-600 shadow-md">
          {!isMobile ? (
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-brand-700">Envie sua solicitação</CardTitle>
              <CardDescription className="text-gray-600">
                Após o envio da sua solicitação, você receberá um formulário com todos os dados do seu sistema, ou um formulário para preenchimento com todos os dados para inclusão no sistema.
              </CardDescription>
            </CardHeader>
          ) : (
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-brand-700">Envie sua solicitação</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Preencha o formulário abaixo para solicitar dados históricos
              </CardDescription>
            </CardHeader>
          )}
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type" className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Tipo de Solicitação</Label>
                  <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-4'} mt-2`}>
                    <Button
                      type="button"
                      variant={formData.type === 'inclusao' ? 'default' : 'outline'}
                      className={`${formData.type === 'inclusao' ? 'bg-brand-600 hover:bg-brand-700' : ''} ${isMobile ? 'w-full' : ''}`}
                      onClick={() => handleTypeChange('inclusao')}
                    >
                      Inclusão de Históricos
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'download' ? 'default' : 'outline'}
                      className={`${formData.type === 'download' ? 'bg-brand-600 hover:bg-brand-700' : ''} ${isMobile ? 'w-full' : ''}`}
                      onClick={() => handleTypeChange('download')}
                    >
                      Download de Históricos
                    </Button>
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
                  <div className="space-y-1">
                    <Label htmlFor="nome" className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Nome</Label>
                    <Input 
                      id="nome" 
                      value={user?.nome || 'Não informado'} 
                      disabled 
                      className="bg-gray-50"
                      size={isMobile ? 'sm' : undefined}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email" className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || 'Não informado'} 
                      disabled 
                      className="bg-gray-50"
                      size={isMobile ? 'sm' : undefined}
                    />
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
                  <div className="space-y-1">
                    <Label htmlFor="matricula" className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Matrícula</Label>
                    <Input 
                      id="matricula" 
                      value={user?.matricula || 'N/A'} 
                      disabled 
                      className="bg-gray-50"
                      size={isMobile ? 'sm' : undefined}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="condominio" className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Condomínio</Label>
                    <Input 
                      id="condominio" 
                      value={user?.nomeCondominio || 'N/A'} 
                      disabled 
                      className="bg-gray-50"
                      size={isMobile ? 'sm' : undefined}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="subject" className={`font-medium ${isMobile ? 'text-sm' : ''}`} required>Assunto</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="Digite o assunto da solicitação" 
                    required 
                    className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                    size={isMobile ? 'sm' : undefined}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="message" className={`font-medium ${isMobile ? 'text-sm' : ''}`} required>Mensagem</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder={formData.type === 'inclusao' 
                      ? "Descreva os dados históricos que deseja incluir no sistema..." 
                      : "Descreva os dados históricos que deseja baixar do sistema..."} 
                    rows={isMobile ? 4 : 6} 
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
              size={isMobile ? 'sm' : undefined}
            >
              Voltar
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${isMobile ? 'w-full' : ''} bg-brand-600 hover:bg-brand-700 transition-colors`}
              size={isMobile ? 'sm' : undefined}
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
