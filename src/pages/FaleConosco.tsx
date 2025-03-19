
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Fale Conosco</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Envie sua mensagem</CardTitle>
            <CardDescription>
              Utilize este formulário para entrar em contato com a administração do sistema.
              Responderemos em até 24 horas úteis.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                Suas informações de identificação serão enviadas automaticamente junto com a mensagem.
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input 
                    id="nome" 
                    value={user?.nome || 'Não informado'} 
                    disabled 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || 'Não informado'} 
                    disabled 
                  />
                </div>
              </div>
              
              {user && !user.isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input 
                      id="matricula" 
                      value={user?.matricula || 'N/A'} 
                      disabled 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condominio">Condomínio</Label>
                    <Input 
                      id="condominio" 
                      value={user?.nomeCondominio || 'N/A'} 
                      disabled 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                  placeholder="Digite o assunto da mensagem" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Digite sua mensagem aqui..." 
                  rows={6} 
                  required 
                />
              </div>
            </form>
          </CardContent>
          
          <CardFooter className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-end gap-4'} pt-2`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className={isMobile ? 'w-full' : ''}
            >
              Voltar
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${isMobile ? 'w-full' : ''} bg-brand-600 hover:bg-brand-700`}
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
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FaleConosco;
