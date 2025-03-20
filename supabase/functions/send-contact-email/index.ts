
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

    // Email template compactado para evitar caracteres =20
    // Removendo quebras de linha e espaços desnecessários no template HTML
    const emailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nova mensagem de contato</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px;background-color:#fff}.section{margin-bottom:20px;border-bottom:1px solid #f0f0f0;padding-bottom:15px}.section:last-child{border-bottom:none;margin-bottom:0}.section h2{color:#4A6CF7;font-size:18px;margin-top:0;margin-bottom:15px}.info-item{margin-bottom:8px}.info-label{font-weight:bold}.message-box{background-color:#f7f7f7;padding:15px;border-radius:6px;margin-top:10px;white-space:pre-wrap}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666}.logo{margin-bottom:10px}</style></head><body><div class="container"><div class="header"><h1>Nova mensagem de contato</h1></div><div class="content"><div class="section"><h2>Dados do Gestor</h2><div class="info-item"><span class="info-label">Nome:</span> ${name}</div><div class="info-item"><span class="info-label">E-mail:</span> ${email}</div><div class="info-item"><span class="info-label">Matrícula:</span> ${matricula || 'N/A'}</div><div class="info-item"><span class="info-label">Condomínio:</span> ${nomeCondominio || 'N/A'}</div></div><div class="section"><h2>Mensagem</h2><div class="info-item"><span class="info-label">Assunto:</span> ${subject}</div><div class="message-box">${message.replace(/\n/g, '<br>')}</div></div></div><div class="footer">Esta mensagem foi enviada através do formulário de contato do Meu Residencial.<br>© 2024 Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Template de confirmação compactado
    const confirmationEmailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Recebemos sua mensagem</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px 30px;background-color:#fff}.message-details{background-color:#f7f7f7;padding:15px;border-radius:6px;margin:15px 0}.highlight{font-weight:bold;color:#4A6CF7}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0}.button{display:inline-block;background-color:#4A6CF7;color:white;text-decoration:none;padding:10px 20px;border-radius:4px;margin-top:20px}</style></head><body><div class="container"><div class="header"><h1>Recebemos sua mensagem!</h1></div><div class="content"><p>Olá, <span class="highlight">${name}</span>!</p><p>Agradecemos por entrar em contato conosco. Sua mensagem foi recebida com sucesso e será analisada pela nossa equipe.</p><div class="message-details"><p><strong>Assunto:</strong> ${subject}</p></div><p>Nossa equipe de suporte responderá em até <span class="highlight">24 horas úteis</span>.</p><p>Se tiver dúvidas adicionais, sinta-se à vontade para responder a este e-mail ou enviar uma nova mensagem através do sistema.</p><p>Atenciosamente,<br>Equipe Meu Residencial</p></div><div class="footer">© 2024 Meu Residencial. Todos os direitos reservados.<br>Este é um e-mail automático, por favor não responda.</div></div></body></html>`;

    // Envio do email com o alias e assunto corrigidos
    await client.send({
      from: "Fale Conosco <noreply@meuresidencial.com>",
      to: "contato@meuresidencial.com",
      subject: `${subject}`,
      html: emailContent,
      replyTo: email,
    });

    // Envio de confirmação para o gestor
    await client.send({
      from: "Fale Conosco <noreply@meuresidencial.com>",
      to: email,
      subject: "Recebemos sua mensagem - Meu Residencial",
      html: confirmationEmailContent,
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
