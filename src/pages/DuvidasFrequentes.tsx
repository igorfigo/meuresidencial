
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useApp } from '@/contexts/AppContext';

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const DuvidasFrequentes = () => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
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
      <div className="min-h-screen bg-gradient-to-b from-[#EFEFEF] to-[#103381] py-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white">Dúvidas Frequentes</h1>
          <Separator className="mb-6 bg-white/30" />
          
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
              <Card key={category} className="mb-6 border-t-4 border-t-custom-primary shadow-md bg-white/90 backdrop-blur-sm">
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
            <Card className="mb-6 border-t-4 border-t-custom-primary shadow-md bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  Nenhuma dúvida encontrada com o termo "{searchTerm}".
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DuvidasFrequentes;
