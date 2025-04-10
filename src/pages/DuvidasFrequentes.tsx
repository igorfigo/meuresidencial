
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search, Mail, Send } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useApp } from '@/contexts/AppContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const contactFormSchema = z.object({
  subject: z.string().min(3, { message: "Assunto deve ter pelo menos 3 caracteres" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const DuvidasFrequentes = () => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Contact form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSending(true);
    try {
      // Call the Supabase edge function to send the email
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: user?.nome || '',
          email: user?.email || '',
          matricula: user?.matricula || '',
          nomeCondominio: user?.nomeCondominio || '',
          subject: data.subject,
          message: data.message,
          isComplaint: false
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Mensagem enviada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente mais tarde.");
    } finally {
      setIsSending(false);
    }
  };
  
  // FAQs categorized by functionality
  const faqItems: FaqItem[] = [
    // Moradores
    {
      question: 'Como adicionar um novo morador?',
      answer: 'Na seção Moradores, clique no botão "Adicionar Morador" e preencha todos os dados requeridos no formulário. Lembre-se que CPF e email são obrigatórios para que o morador possa acessar o sistema.',
      category: 'Moradores'
    },
    {
      question: 'Como editar dados de um morador existente?',
      answer: 'Na listagem de moradores, clique no ícone de edição (lápis) ao lado do nome do morador que deseja modificar. Altere os dados necessários e salve as alterações.',
      category: 'Moradores'
    },
    {
      question: 'Como desativar o acesso de um morador que se mudou?',
      answer: 'Na lista de moradores, localize o morador e clique no botão de status ativo/inativo. Desative o acesso e confirme a alteração. O morador não poderá mais acessar o sistema, mas seus dados históricos serão mantidos.',
      category: 'Moradores'
    },
    
    // Comunicados
    {
      question: 'Como enviar um comunicado para todos os moradores?',
      answer: 'Na seção Comunicados, clique em "Novo Comunicado", preencha o título e o conteúdo, e escolha a opção de envio para todos os moradores. Você pode optar por enviar por email, WhatsApp ou ambos.',
      category: 'Comunicados'
    },
    {
      question: 'Como verificar se um comunicado foi visualizado pelos moradores?',
      answer: 'Na lista de comunicados enviados, existe uma coluna indicando quantos moradores visualizaram cada comunicado. Clique em "Detalhes" para ver exatamente quais moradores já viram o comunicado.',
      category: 'Comunicados'
    },
    {
      question: 'Como usar os modelos pré-prontos de comunicados?',
      answer: 'Ao criar um novo comunicado, clique em "Usar Modelo" para acessar diversos templates pré-configurados. Selecione o modelo desejado e personalize-o conforme necessário.',
      category: 'Comunicados'
    },
    
    // Documentos Úteis
    {
      question: 'Quais tipos de arquivos posso disponibilizar na seção de Documentos?',
      answer: 'Você pode fazer upload de arquivos PDF, Word, Excel, PowerPoint e imagens. Cada arquivo pode ter até 10MB. Para arquivos maiores, recomendamos comprimi-los antes do upload.',
      category: 'Documentos Úteis'
    },
    {
      question: 'Como organizar os documentos por categoria?',
      answer: 'Ao adicionar um novo documento, selecione ou crie uma categoria na opção "Tipo". Isso ajudará os moradores a encontrarem mais facilmente os documentos que procuram.',
      category: 'Documentos Úteis'
    },
    
    // Financeiro
    {
      question: 'Como registrar uma nova receita?',
      answer: 'No módulo Financeiro, acesse a aba Receitas/Despesas e clique em "Nova Receita". Preencha os dados como valor, data de pagamento, categoria e observações.',
      category: 'Financeiro'
    },
    {
      question: 'Como gerar relatórios financeiros para apresentação aos moradores?',
      answer: 'Na seção Financeiro > Prestação de Contas, selecione o mês desejado e clique em "Gerar Relatório". Você pode exportar em PDF e compartilhar com os moradores durante a assembleia ou via email.',
      category: 'Financeiro'
    },
    {
      question: 'Como configurar o recebimento por PIX?',
      answer: 'Acesse Financeiro > Recebimento PIX e configure sua chave PIX, o dia de vencimento padrão e a taxa de juros para pagamentos em atraso. Essa configuração será usada para gerar QR Codes de pagamento.',
      category: 'Financeiro'
    },
    
    // Áreas Comuns
    {
      question: 'Como cadastrar uma nova área comum?',
      answer: 'Na seção Áreas Comuns, clique em "Nova Área" e preencha as informações como nome, capacidade, horários de funcionamento e regras de uso.',
      category: 'Áreas Comuns'
    },
    {
      question: 'Como aprovar ou negar solicitações de reserva de áreas comuns?',
      answer: 'As solicitações de reserva aparecem no calendário. Clique sobre a reserva e escolha "Aprovar" ou "Recusar". Você pode adicionar um comentário para o morador em caso de recusa.',
      category: 'Áreas Comuns'
    },
    
    // Dedetizações
    {
      question: 'Como registrar uma nova dedetização?',
      answer: 'Na seção Dedetizações, clique em "Nova Dedetização" e preencha os dados como empresa contratada, data de realização e tipo de serviço. Você pode anexar o certificado emitido pela empresa.',
      category: 'Dedetizações'
    },
    {
      question: 'Como os moradores são notificados sobre dedetizações programadas?',
      answer: 'Ao registrar uma dedetização, marque a opção "Notificar Moradores" para que um comunicado automático seja enviado com antecedência, informando data e horário do serviço.',
      category: 'Dedetizações'
    },
    
    // Garagem Livre
    {
      question: 'Como gerenciar as vagas disponíveis para aluguel?',
      answer: 'Na seção Garagem Livre, você pode visualizar todas as vagas cadastradas. Para moderar anúncios inapropriados, utilize o botão "Desativar" ao lado da vaga em questão.',
      category: 'Garagem Livre'
    },
    
    // Dados Históricos
    {
      question: 'Por quanto tempo os dados históricos ficam disponíveis?',
      answer: 'Todos os dados históricos do condomínio são mantidos por 5 anos. Isso inclui relatórios financeiros, comunicados e documentos. Para períodos anteriores, entre em contato com o suporte.',
      category: 'Dados Históricos'
    },
    
    // Minha Assinatura
    {
      question: 'Como alterar o plano contratado?',
      answer: 'Na seção Minha Assinatura, você encontrará informações sobre seu plano atual e opções de upgrade. Selecione o novo plano desejado e siga as instruções para concluir a alteração.',
      category: 'Minha Assinatura'
    }
  ];
  
  // Filter faqs based on search term
  const filteredFaqs = faqItems.filter(
    (faq) => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FaqItem[]>);
  
  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <header className="mb-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Dúvidas/Contato</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Encontre respostas para as perguntas mais comuns sobre o sistema ou entre em contato conosco.
          </p>
          <Separator className="mt-4" />
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input 
            className="pl-10" 
            placeholder="Pesquisar dúvidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {Object.entries(groupedFaqs).length > 0 ? (
          Object.entries(groupedFaqs).map(([category, faqs]) => (
            <Card key={category} className="mb-6 border-t-4 border-t-brand-600 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`${category}-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="mb-6 border-t-4 border-t-brand-600 shadow-md">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                Nenhuma dúvida encontrada com o termo "{searchTerm}".
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Contact Form Section (from Fale Conosco) */}
        <Card className="mb-6 border-t-4 border-t-blue-600 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Fale Conosco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Não encontrou o que procurava? Entre em contato com nossa equipe preenchendo o formulário abaixo.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Dúvida sobre sistema" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva sua dúvida ou solicitação em detalhes..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="bg-brand-600 hover:bg-brand-700 flex items-center"
                  >
                    {isSending ? "Enviando..." : "Enviar Mensagem"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DuvidasFrequentes;
