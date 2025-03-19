
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

    // Composição do email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4A6CF7;">Nova mensagem de contato</h1>
        
        <h2>Dados do Gestor:</h2>
        <ul>
          <li><strong>Nome:</strong> ${name}</li>
          <li><strong>E-mail:</strong> ${email}</li>
          <li><strong>Matrícula:</strong> ${matricula || 'N/A'}</li>
          <li><strong>Condomínio:</strong> ${nomeCondominio || 'N/A'}</li>
        </ul>
        
        <h2>Mensagem:</h2>
        <p><strong>Assunto:</strong> ${subject}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
          Esta mensagem foi enviada através do formulário de contato do Meu Residencial.
        </p>
      </div>
    `;

    // Envio do email
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: "contato@meuresidencial.com",
      subject: `Contato: ${subject}`,
      html: emailContent,
      replyTo: email,
    });

    // Envio de confirmação para o gestor
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: email,
      subject: "Recebemos sua mensagem - Meu Residencial",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #4A6CF7;">Recebemos sua mensagem!</h1>
          
          <p>Olá, ${name}!</p>
          
          <p>Agradecemos por entrar em contato conosco. Sua mensagem foi recebida com sucesso!</p>
          
          <p><strong>Assunto:</strong> ${subject}</p>
          
          <p>Nossa equipe de suporte responderá em até 24 horas úteis.</p>
          
          <p>Atenciosamente,<br>Equipe Meu Residencial</p>
          
          <div style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
            <p>© 2024 Meu Residencial. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
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
