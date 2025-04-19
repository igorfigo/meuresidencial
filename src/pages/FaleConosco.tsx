
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
import { Loader2, Send, MessageCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const FaleConosco = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.nome || 'Nome não informado',
          email: user?.email || 'Email não informado',
          matricula: user?.matricula || 'N/A',
          nomeCondominio: user?.nomeCondominio || 'N/A',
          subject: formData.subject,
          message: formData.message
        }
      });
      
      if (error) throw error;
      
      toast.success('Mensagem enviada com sucesso! Responderemos em até 24 horas úteis.');
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openWhatsApp = () => {
    const whatsappNumber = '5511914420166';
    const message = `Olá, sou ${user?.nome || 'gestor'} do condomínio ${user?.nomeCondominio || ''} e gostaria de falar com a equipe de suporte.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  // Custom top bar content for mobile
  const mobileTopBarContent = (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2"
        onClick={() => navigate('/dashboard')}
      >
        <Home className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold truncate">Fale Conosco</h1>
    </div>
  );
  
  return (
    <DashboardLayout mobileTopBarContent={isMobile ? mobileTopBarContent : undefined}>
      <div className={`container mx-auto py-${isMobile ? '4' : '6'} ${isMobile ? 'px-2' : 'max-w-3xl'}`}>
        {!isMobile && (
          <>
            <h1 className="text-3xl font-bold mb-2">Fale Conosco</h1>
            <Separator className="mb-2" />
            <p className="text-gray-600 mb-6">
              Entre em contato com nossa equipe de suporte. Responderemos sua mensagem em até 24 horas úteis.
            </p>
          </>
        )}
        
        <Card className={`border-t-4 border-t-custom-primary shadow-md ${isMobile ? 'mx-0' : ''}`}>
          {!isMobile && (
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-brand-700">Envie sua mensagem</CardTitle>
              <CardDescription className="text-gray-600">
                Utilize este formulário para entrar em contato com a administração do sistema.
                Responderemos em até 24 horas úteis.
              </CardDescription>
            </CardHeader>
          )}
          
          <CardContent className={isMobile ? "pt-4 px-3" : ""}>
            <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
              <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'}`}>
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
              
              {user && !user.isAdmin && (
                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'}`}>
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
              )}
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="font-medium" required>Assunto</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  placeholder="Digite o assunto da mensagem" 
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
                  placeholder="Digite sua mensagem aqui..." 
                  rows={isMobile ? 4 : 6} 
                  required 
                  className="border-gray-300 focus:border-brand-500 focus:ring-brand-500 resize-none"
                />
              </div>
            </form>
          </CardContent>
          
          <CardFooter className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between gap-4'} pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg ${isMobile ? 'px-3 pb-3' : ''}`}>
            <Button
              onClick={openWhatsApp}
              className={`${isMobile ? 'w-full' : ''} bg-green-600 hover:bg-green-700 transition-colors`}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contatar via WhatsApp
            </Button>
            
            <div className={`flex ${isMobile ? 'flex-col w-full' : ''} gap-3`}>
              {!isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                >
                  Voltar
                </Button>
              )}
              
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
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FaleConosco;
