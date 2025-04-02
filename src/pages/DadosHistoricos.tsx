
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
import { Loader2, Send, History, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalDataPixSection } from '@/components/pix/HistoricalDataPixSection';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DadosHistoricos = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    request_type: 'inclusao' // Default to 'inclusao', could be 'download'
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
  
  const handleRequestTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, request_type: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert into the database with type assertion
      const { error } = await supabase
        .from('historical_data_requests' as any)
        .insert({
          matricula: user?.matricula,
          condominium_name: user?.nomeCondominio,
          manager_name: user?.nome,
          manager_email: user?.email,
          request_type: formData.request_type,
          subject: formData.subject,
          message: formData.message,
          payment_status: 'pending',
          status: 'new'
        });
      
      if (error) throw error;
      
      toast.success('Solicitação cadastrada com sucesso! Em breve entraremos em contato.');
      setFormData({ subject: '', message: '', request_type: 'inclusao' });
    } catch (error) {
      console.error('Erro ao cadastrar solicitação:', error);
      toast.error('Erro ao cadastrar solicitação. Por favor, tente novamente.');
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
        
        <Card className="border-t-4 border-t-brand-600 shadow-md mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-brand-700">Solicitar Dados Históricos</CardTitle>
            <CardDescription className="text-gray-600">
              Escolha o tipo de solicitação, preencha os dados necessários e envie sua solicitação.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="request_type" className="font-medium">Tipo de Solicitação</Label>
                  <RadioGroup 
                    defaultValue={formData.request_type} 
                    value={formData.request_type}
                    onValueChange={handleRequestTypeChange}
                    className="flex flex-col space-y-3 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="inclusao" id="inclusao" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Upload className="h-5 w-5 text-brand-600" />
                        <Label htmlFor="inclusao" className="font-medium cursor-pointer">
                          Inclusão de Históricos
                          <p className="text-sm font-normal text-gray-500 mt-1">
                            Solicite a inclusão de dados históricos no sistema.
                          </p>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="download" id="download" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Download className="h-5 w-5 text-brand-600" />
                        <Label htmlFor="download" className="font-medium cursor-pointer">
                          Download de Históricos
                          <p className="text-sm font-normal text-gray-500 mt-1">
                            Solicite o download de dados históricos do seu condomínio.
                          </p>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
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
                    placeholder={formData.request_type === 'inclusao' 
                      ? "Descreva os dados históricos que deseja incluir no sistema..." 
                      : "Descreva os dados históricos que deseja baixar do sistema..."} 
                    rows={6} 
                    required 
                    className="border-gray-300 focus:border-brand-500 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>
              
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-end gap-4'}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className={`${isMobile ? 'w-full' : ''} border-gray-300 hover:bg-gray-100 hover:text-gray-700`}
                >
                  Voltar
                </Button>
                
                <Button 
                  type="submit"
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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DadosHistoricos;
