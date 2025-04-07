
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
import { AlertTriangle, Loader2, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const SugestaoReclamacao = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'sugestao' // Default to 'sugestao', could be 'reclamacao'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  // Check if user is a resident
  if (!user?.isResident) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-4 px-2 sm:py-6 sm:px-6 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sugestão/Reclamação</h1>
          <Separator className="mb-4" />
          <Card className="border-t-4 shadow-md" style={{ borderTopColor: '#2151B9' }}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-2">Acesso Restrito</h3>
                  <p className="text-gray-600">
                    Esta funcionalidade está disponível apenas para moradores do condomínio.
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
  
  const handleTypeChange = (type: 'sugestao' | 'reclamacao') => {
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
      
      // Get manager's email from the user's condominium data
      const { data: condominiumData, error: condoError } = await supabase
        .from('condominiums')
        .select('emaillegal')
        .eq('matricula', user.matricula)
        .single();
      
      if (condoError) {
        throw new Error('Não foi possível encontrar o email do síndico');
      }
      
      const managerEmail = condominiumData.emaillegal;
      
      if (!managerEmail) {
        throw new Error('Email do síndico não cadastrado');
      }
      
      const typeText = formData.type === 'sugestao' ? 'Sugestão' : 'Reclamação';
      
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.nome || 'Nome não informado',
          email: user?.email || 'Email não informado',
          matricula: user?.matricula || 'N/A',
          nomeCondominio: user?.nomeCondominio || 'N/A',
          unit: user?.unit || 'N/A',
          subject: `[${typeText}] ${formData.subject}`,
          message: formData.message,
          // Additional fields specific to this functionality
          isComplaint: true,
          managerEmail: managerEmail
        }
      });
      
      if (error) throw error;
      
      setSuccessDialogOpen(true);
      setFormData({ subject: '', message: '', type: 'sugestao' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-4 px-0 sm:py-6 sm:px-6 max-w-3xl">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sugestão/Reclamação</h1>
          <Separator className="mb-2" />
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Envie sugestões ou reclamações diretamente para o síndico do seu condomínio.
          </p>
        </div>
        
        <Card className="border-t-4 border-t-brand-600 shadow-md mx-0 rounded-none sm:rounded-lg sm:mx-auto">
          <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-6 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-brand-700">Envie sua mensagem</CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Use este formulário para enviar sua mensagem ao síndico.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pt-2 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="type" className="font-medium mb-2 block">Tipo de mensagem</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.type === 'sugestao' ? 'default' : 'outline'}
                      className={`flex items-center justify-center h-10 ${formData.type === 'sugestao' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
                      onClick={() => handleTypeChange('sugestao')}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      <span>Sugestão</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'reclamacao' ? 'default' : 'outline'}
                      className={`flex items-center justify-center h-10 ${formData.type === 'reclamacao' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
                      onClick={() => handleTypeChange('reclamacao')}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      <span>Reclamação</span>
                    </Button>
                  </div>
                </div>
                
                <div className="pt-1">
                  <Label htmlFor="nome" className="font-medium block mb-1">Seus dados</Label>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nome</p>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                        {user?.nome || 'Não informado'}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <div className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                        {user?.email || 'Não informado'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Condomínio</p>
                        <div className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm truncate">
                          {user?.nomeCondominio || 'N/A'}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Unidade</p>
                        <div className="bg-gray-50 p-2 rounded-md border border-gray-200 text-sm">
                          {user?.unit || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 pt-1">
                  <Label htmlFor="subject" className="font-medium" required>Assunto</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange} 
                    placeholder="Digite o assunto da mensagem" 
                    required 
                    className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="message" className="font-medium" required>Mensagem</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    placeholder="Digite sua mensagem detalhadamente..." 
                    rows={4} 
                    required 
                    className="border-gray-300 focus:border-brand-500 focus:ring-brand-500 resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.message.length}/1000 caracteres
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-none sm:rounded-b-lg p-4">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 transition-colors h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar {formData.type === 'sugestao' ? 'Sugestão' : 'Reclamação'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Mensagem enviada</DialogTitle>
              <DialogDescription className="text-center">
                Sua {formData.type === 'sugestao' ? 'sugestão' : 'reclamação'} foi enviada com sucesso!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-4">
              <div className="rounded-full bg-green-100 p-3">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">
              O síndico do seu condomínio responderá em breve.
            </p>
            <DialogFooter className="sm:justify-center">
              <Button 
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Entendi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SugestaoReclamacao;
