
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      name, 
      email, 
      matricula, 
      nomeCondominio, 
      unit,
      subject, 
      message,
      isComplaint,
      managerEmail 
    } = await req.json();

    console.log(`Recebendo solicitação de ${isComplaint ? 'sugestão/reclamação' : 'contato'} de: ${email}`);

    // Configuração do cliente SMTP
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.hostinger.com",
        port: 465,
        tls: true,
        auth: {
          username: "noreply@meuresidencial.com",
          password: "Bigdream@2025",
        },
      },
    });

    // Determine if this is a historical data request more accurately
    const isHistoricalData = subject.toLowerCase().includes('histórico') || 
                            subject.toLowerCase().includes('historico') || 
                            (subject.startsWith('Solicitação de Inclusão de Históricos:') || 
                             subject.startsWith('Solicitação de Download de Históricos:'));
    
    // Simplified HTML template structure with minimum formatting to prevent encoding issues
    const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; }
.header { background-color: #4A6CF7; padding: 20px; text-align: center; }
.header h1 { color: white; margin: 0; font-size: 24px; }
.content { padding: 20px; background-color: #ffffff; }
.footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>${title}</h1>
</div>
<div class="content">
${content}
</div>
<div class="footer">
© 2024 Meu Residencial. Todos os direitos reservados.<br>
Este é um e-mail automático, por favor não responda.
</div>
</div>
</body>
</html>`;
    
    // Content for regular emails
    const regularEmailContent = baseTemplate(
      'Nova mensagem de contato',
      `
<h2>Dados do Gestor</h2>
<p><strong>Nome:</strong> ${name}</p>
<p><strong>E-mail:</strong> ${email}</p>
<p><strong>Matrícula:</strong> ${matricula || 'N/A'}</p>
<p><strong>Condomínio:</strong> ${nomeCondominio || 'N/A'}</p>
<h2>Mensagem</h2>
<p><strong>Assunto:</strong> ${subject}</p>
<div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin-top: 10px;">
${message.replace(/\n/g, '<br>')}
</div>
`
    );

    // Content for historical data emails
    const historicalDataEmailContent = baseTemplate(
      'Solicitação de Dados Históricos',
      `
<h2>Dados do Gestor</h2>
<p><strong>Nome:</strong> ${name}</p>
<p><strong>E-mail:</strong> ${email}</p>
<p><strong>Matrícula:</strong> ${matricula || 'N/A'}</p>
<p><strong>Condomínio:</strong> ${nomeCondominio || 'N/A'}</p>
<h2>Mensagem</h2>
<p><strong>Assunto:</strong> ${subject}</p>
<div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin-top: 10px;">
${message.replace(/\n/g, '<br>')}
</div>
`
    );

    // Content for complaint emails
    const complaintEmailContent = baseTemplate(
      `Nova ${subject.includes('Sugestão') ? 'sugestão' : 'reclamação'} de morador`,
      `
<h2>Dados do Morador</h2>
<p><strong>Nome:</strong> ${name}</p>
<p><strong>E-mail:</strong> ${email}</p>
<p><strong>Condomínio:</strong> ${nomeCondominio || 'N/A'}</p>
<p><strong>Unidade:</strong> ${unit || 'N/A'}</p>
<h2>Mensagem</h2>
<p><strong>Assunto:</strong> ${subject}</p>
<div style="background-color: #f7f7f7; padding: 15px; border-radius: 6px; margin-top: 10px;">
${message.replace(/\n/g, '<br>')}
</div>
`
    );

    // Confirmation email content
    const confirmationEmailContent = baseTemplate(
      'Recebemos sua mensagem',
      `
<p>Olá, <strong>${name}</strong>!</p>
<p>Agradecemos por entrar em contato conosco. Sua mensagem foi recebida com sucesso e será analisada pela nossa equipe.</p>
<p><strong>Assunto:</strong> ${subject}</p>
<p>${isComplaint ? 'O síndico do seu condomínio responderá em breve.' : (isHistoricalData ? 'Nossa equipe responderá com uma cotação em até <strong>24 horas úteis</strong>.' : 'Nossa equipe de suporte responderá em até <strong>24 horas úteis</strong>.')}</p>
<p>Se tiver dúvidas adicionais, sinta-se à vontade para enviar uma nova mensagem através do sistema.</p>
<p>Atenciosamente,<br>${isComplaint ? 'Administração do Condomínio' : 'Equipe Meu Residencial'}</p>
`
    );

    // Determine the email content and recipient based on the request type
    let emailContent;
    let emailSubject;
    let fromEmail;
    let recipient;
    
    if (isComplaint) {
      emailContent = complaintEmailContent;
      emailSubject = `${subject} - Morador: ${name} (${unit})`;
      fromEmail = "Sugestões e Reclamações <noreply@meuresidencial.com>";
      recipient = managerEmail;
    } else if (isHistoricalData) {
      emailContent = historicalDataEmailContent;
      emailSubject = subject;
      fromEmail = "Dados Históricos <noreply@meuresidencial.com>";
      // Updated to explicitly set to contato@meuresidencial.com for historical data
      recipient = "contato@meuresidencial.com";
      console.log("Enviando solicitação de dados históricos para: contato@meuresidencial.com");
    } else {
      emailContent = regularEmailContent;
      emailSubject = subject;
      fromEmail = "Fale Conosco <noreply@meuresidencial.com>";
      recipient = "contato@meuresidencial.com";
    }

    // Set specific email headers to improve deliverability and formatting
    const emailHeaders = {
      "MIME-Version": "1.0",
      "Content-Type": "text/html; charset=UTF-8",
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "Importance": "Normal",
      "X-Mailer": "MeuResidencial"
    };

    // Debug log to check recipient
    console.log(`Enviando email principal para: ${recipient}`);

    try {
      // Send email to the appropriate recipient
      await client.send({
        from: fromEmail,
        to: recipient,
        subject: emailSubject,
        html: emailContent,
        replyTo: email,
        headers: emailHeaders
      });
      console.log(`Email principal enviado com sucesso para ${recipient}`);
    } catch (emailError) {
      console.error("Erro ao enviar email principal:", emailError);
      throw emailError;
    }

    // For historical data requests, send confirmation to the manager (sender)
    if (isHistoricalData) {
      const historicalConfirmationSubject = "Recebemos sua solicitação de Dados Históricos - Meu Residencial";
      
      try {
        console.log(`Enviando email de confirmação para: ${email}`);
        await client.send({
          from: "Dados Históricos <noreply@meuresidencial.com>",
          to: email,
          subject: historicalConfirmationSubject,
          html: confirmationEmailContent,
          headers: emailHeaders
        });
        console.log(`Email de confirmação enviado com sucesso para ${email}`);
      } catch (confirmEmailError) {
        console.error("Erro ao enviar email de confirmação:", confirmEmailError);
        // Don't throw here - we still sent the main email
      }
    } 
    // For non-historical data requests, follow the previous logic
    else if (!isHistoricalData) {
      const confirmationSubject = isComplaint ? 
                `Recebemos sua ${subject.includes('Sugestão') ? 'sugestão' : 'reclamação'} - Meu Residencial` : 
                "Recebemos sua mensagem - Meu Residencial";
      
      try {
        await client.send({
          from: isComplaint ? "Sugestões e Reclamações <noreply@meuresidencial.com>" : "Fale Conosco <noreply@meuresidencial.com>",
          to: email,
          subject: confirmationSubject,
          html: confirmationEmailContent,
          headers: emailHeaders
        });
        console.log(`Email de confirmação enviado com sucesso para ${email}`);
      } catch (confirmEmailError) {
        console.error("Erro ao enviar email de confirmação:", confirmEmailError);
        // Don't throw here - we still sent the main email
      }
    }

    try {
      await client.close();
      console.log('Cliente SMTP fechado com sucesso');
    } catch (closeError) {
      console.error("Erro ao fechar cliente SMTP:", closeError);
      // Don't throw here - emails were already sent
    }
    
    console.log('Processo de envio de e-mails concluído');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
