
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
      matricula,
      currentName,
      currentEmail,
      currentPhone,
      currentAddress,
      newName,
      newEmail,
      newPhone,
      newAddress
    } = await req.json();

    console.log(`Recebendo solicitação de troca de gestor para matrícula: ${matricula}`);

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

    // Email template para a solicitação
    const emailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Solicitação de Troca de Gestor</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px;background-color:#fff}.section{margin-bottom:20px;border-bottom:1px solid #f0f0f0;padding-bottom:15px}.section:last-child{border-bottom:none;margin-bottom:0}.section h2{color:#4A6CF7;font-size:18px;margin-top:0;margin-bottom:15px}.info-item{margin-bottom:8px}.info-label{font-weight:bold}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666}</style></head><body><div class="container"><div class="header"><h1>Solicitação de Troca de Gestor</h1></div><div class="content"><div class="section"><h2>Dados do Condomínio</h2><div class="info-item"><span class="info-label">Matrícula:</span> ${matricula}</div></div><div class="section"><h2>Gestor Atual</h2><div class="info-item"><span class="info-label">Nome:</span> ${currentName || 'N/A'}</div><div class="info-item"><span class="info-label">E-mail:</span> ${currentEmail || 'N/A'}</div><div class="info-item"><span class="info-label">Telefone:</span> ${currentPhone || 'N/A'}</div><div class="info-item"><span class="info-label">Endereço:</span> ${currentAddress || 'N/A'}</div></div><div class="section"><h2>Novo Gestor</h2><div class="info-item"><span class="info-label">Nome:</span> ${newName}</div><div class="info-item"><span class="info-label">E-mail:</span> ${newEmail}</div><div class="info-item"><span class="info-label">Telefone:</span> ${newPhone}</div><div class="info-item"><span class="info-label">Endereço:</span> ${newAddress}</div></div></div><div class="footer">Esta solicitação foi enviada através do sistema Meu Residencial.<br>© 2024 Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Template de confirmação para o gestor atual
    const confirmationEmailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Recebemos sua solicitação</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px 30px;background-color:#fff}.highlight{font-weight:bold;color:#4A6CF7}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>Recebemos sua solicitação!</h1></div><div class="content"><p>Olá!</p><p>Agradecemos por enviar sua solicitação de troca de gestor para o condomínio com matrícula <span class="highlight">${matricula}</span>.</p><p>Nossa equipe analisará as informações fornecidas e entrará em contato em até <span class="highlight">24 horas úteis</span>.</p><p>Se você tiver alguma dúvida adicional, responda a este e-mail ou entre em contato através do formulário "Fale Conosco" em nossa plataforma.</p><p>Atenciosamente,<br>Equipe Meu Residencial</p></div><div class="footer">© 2024 Meu Residencial. Todos os direitos reservados.<br>Este é um e-mail automático, por favor não responda.</div></div></body></html>`;

    // Envio do email para a empresa
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: "contato@meuresidencial.com",
      subject: `Solicitação de Troca de Gestor - Matrícula ${matricula}`,
      html: emailContent,
      replyTo: currentEmail || newEmail,
    });

    // Envio de confirmação para o gestor atual
    if (currentEmail) {
      await client.send({
        from: "Meu Residencial <noreply@meuresidencial.com>",
        to: currentEmail,
        subject: "Recebemos sua solicitação de troca de gestor - Meu Residencial",
        html: confirmationEmailContent,
      });
    }

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
    console.error('Erro ao enviar e-mail de solicitação de troca de gestor:', error);
    
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
