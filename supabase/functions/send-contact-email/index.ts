
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
      subject, 
      message 
    } = await req.json();

    console.log(`Recebendo solicitação de contato de: ${email}`);

    // Configuração do cliente SMTP com melhores práticas
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
      pool: true,
      rateLimit: 5,
    });

    // Email template melhorado para evitar filtros de spam
    const emailContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova mensagem de contato</title>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;">
    <div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#4A6CF7;padding:20px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">Nova mensagem de contato</h1>
        </div>
        <div style="padding:20px;background-color:#fff;">
            <div style="margin-bottom:20px;border-bottom:1px solid #f0f0f0;padding-bottom:15px;">
                <h2 style="color:#4A6CF7;font-size:18px;margin-top:0;margin-bottom:15px;">Dados do Gestor</h2>
                <div style="margin-bottom:8px;"><span style="font-weight:bold;">Nome:</span> ${name}</div>
                <div style="margin-bottom:8px;"><span style="font-weight:bold;">E-mail:</span> ${email}</div>
                <div style="margin-bottom:8px;"><span style="font-weight:bold;">Matrícula:</span> ${matricula || 'N/A'}</div>
                <div style="margin-bottom:8px;"><span style="font-weight:bold;">Condomínio:</span> ${nomeCondominio || 'N/A'}</div>
            </div>
            <div>
                <h2 style="color:#4A6CF7;font-size:18px;margin-top:0;margin-bottom:15px;">Mensagem</h2>
                <div style="margin-bottom:8px;"><span style="font-weight:bold;">Assunto:</span> ${subject}</div>
                <div style="background-color:#f7f7f7;padding:15px;border-radius:6px;margin-top:10px;white-space:pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
        <div style="background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;">
            <p>Esta mensagem foi enviada através do formulário de contato do Meu Residencial.<br>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>`;

    // Template de confirmação melhorado
    const confirmationEmailContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recebemos sua mensagem</title>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;">
    <div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <div style="background-color:#4A6CF7;padding:20px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">Recebemos sua mensagem!</h1>
        </div>
        <div style="padding:20px 30px;background-color:#fff;">
            <p>Olá, <span style="font-weight:bold;color:#4A6CF7;">${name}</span>!</p>
            <p>Agradecemos por entrar em contato conosco. Sua mensagem foi recebida com sucesso e será analisada pela nossa equipe.</p>
            <div style="background-color:#f7f7f7;padding:15px;border-radius:6px;margin:15px 0;">
                <p><strong>Assunto:</strong> ${subject}</p>
            </div>
            <p>Nossa equipe de suporte responderá em até <span style="font-weight:bold;color:#4A6CF7;">24 horas úteis</span>.</p>
            <p>Se tiver dúvidas adicionais, sinta-se à vontade para responder a este e-mail ou enviar uma nova mensagem através do sistema.</p>
            <p>Atenciosamente,<br>Equipe Meu Residencial</p>
        </div>
        <div style="background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0;">
            <p>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.<br>
            Este é um e-mail de confirmação automático, não é necessário responder.</p>
        </div>
    </div>
</body>
</html>`;

    // Envio do email com headers apropriados para evitar spam
    await client.send({
      from: { name: "Meu Residencial - Contato", address: "noreply@meuresidencial.com" },
      to: { name: "Equipe Meu Residencial", address: "contato@meuresidencial.com" },
      subject: `Contato: ${subject}`,
      html: emailContent,
      replyTo: email,
      headers: {
        "X-Priority": "1", // High priority for support team
        "Importance": "high",
        "X-MSMail-Priority": "High",
        "X-Entity-Ref-ID": `contact-${new Date().getTime()}`,
      },
      priority: "high"
    });

    // Envio de confirmação para o gestor com headers anti-spam
    await client.send({
      from: { name: "Meu Residencial - Suporte", address: "noreply@meuresidencial.com" },
      to: { name: name, address: email },
      subject: "Recebemos sua mensagem - Meu Residencial",
      html: confirmationEmailContent,
      headers: {
        "List-Unsubscribe": "<mailto:suporte@meuresidencial.com?subject=unsubscribe>",
        "Precedence": "bulk",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Feedback-ID": `confirmation:meuresidencial`,
        "X-Entity-Ref-ID": `confirmation-${new Date().getTime()}`,
      },
      priority: "normal"
    });

    await client.close();
    
    console.log('E-mails enviados com sucesso');

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
    console.error('Erro ao enviar e-mail de contato:', error);
    
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
