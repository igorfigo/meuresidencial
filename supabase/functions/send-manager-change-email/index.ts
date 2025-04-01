
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
      newName,
      newEmail,
      newPhone,
      newAddress,
      newPassword
    } = await req.json();

    console.log(`Processando alteração de gestor para matrícula: ${matricula}`);

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

    // Email template para o novo gestor com as credenciais de acesso
    const emailToNewManagerContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bem-vindo ao Meu Residencial - Suas Credenciais de Acesso</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px 30px;background-color:#fff}.credentials{background-color:#f7f7f7;border-radius:5px;padding:15px;margin:20px 0}.credentials p{margin:8px 0}.credentials strong{color:#4A6CF7}.highlight{font-weight:bold;color:#4A6CF7}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>Bem-vindo ao Meu Residencial!</h1></div><div class="content"><p>Olá, <strong>${newName}</strong>!</p><p>Você foi designado como o novo gestor do condomínio com matrícula <span class="highlight">${matricula}</span>.</p><p>Abaixo estão suas credenciais de acesso à plataforma Meu Residencial:</p><div class="credentials"><p><strong>Usuário:</strong> ${newEmail}</p><p><strong>Senha Inicial:</strong> ${newPassword}</p></div><p>Recomendamos que você altere sua senha após o primeiro acesso.</p><p>Se tiver qualquer dúvida, entre em contato conosco através do formulário "Fale Conosco" na plataforma.</p><p>Atenciosamente,<br>Equipe Meu Residencial</p></div><div class="footer">© 2024 Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Email informativo para o email da nossa empresa
    const notificationEmailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Alteração de Gestor Realizada</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px;background-color:#fff}.section{margin-bottom:20px;border-bottom:1px solid #f0f0f0;padding-bottom:15px}.section:last-child{border-bottom:none;margin-bottom:0}.section h2{color:#4A6CF7;font-size:18px;margin-top:0;margin-bottom:15px}.info-item{margin-bottom:8px}.info-label{font-weight:bold}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666}</style></head><body><div class="container"><div class="header"><h1>Alteração de Gestor Realizada</h1></div><div class="content"><div class="section"><h2>Dados do Condomínio</h2><div class="info-item"><span class="info-label">Matrícula:</span> ${matricula}</div></div><div class="section"><h2>Gestor Anterior</h2><div class="info-item"><span class="info-label">Nome:</span> ${currentName || 'N/A'}</div><div class="info-item"><span class="info-label">E-mail:</span> ${currentEmail || 'N/A'}</div></div><div class="section"><h2>Novo Gestor</h2><div class="info-item"><span class="info-label">Nome:</span> ${newName}</div><div class="info-item"><span class="info-label">E-mail:</span> ${newEmail}</div><div class="info-item"><span class="info-label">Telefone:</span> ${newPhone}</div><div class="info-item"><span class="info-label">Endereço:</span> ${newAddress}</div></div></div><div class="footer">Esta alteração foi realizada através do sistema Meu Residencial.<br>© 2024 Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Envio do email para o novo gestor
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: newEmail,
      subject: "Bem-vindo ao Meu Residencial - Suas Credenciais de Acesso",
      html: emailToNewManagerContent,
    });

    // Envio do email para a empresa
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: "contato@meuresidencial.com",
      subject: `Alteração de Gestor Realizada - Matrícula ${matricula}`,
      html: notificationEmailContent,
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
    console.error('Erro ao enviar e-mails de alteração de gestor:', error);
    
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
