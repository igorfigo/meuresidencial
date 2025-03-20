
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
    const { emailLegal, matricula, senha, nomeCondominio, nomelegal } = await req.json();

    if (!emailLegal) {
      return new Response(
        JSON.stringify({ error: 'O e-mail do representante legal é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enviando e-mail de boas-vindas para: ${emailLegal}`);

    const nomeCondo = nomeCondominio || 'seu condomínio';
    const nomeRepresentante = nomelegal || 'Representante Legal';

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
      // Add DKIM configuration
      pool: 5,
      dkim: {
        domainName: "meuresidencial.com",
        keySelector: "default",
        privateKey: Deno.env.get("DKIM_PRIVATE_KEY") || "",
      },
    });

    // Add email authentication headers
    const emailHeaders = {
      // SPF is handled at DNS level, but we can add Return-Path for alignment
      "Return-Path": "noreply@meuresidencial.com",
      // Additional headers to improve deliverability
      "X-Mailer": "Meu Residencial System",
      "List-Unsubscribe": "<mailto:unsubscribe@meuresidencial.com>",
      // DMARC alignment is enforced by ensuring From header matches domain with SPF/DKIM records
    };

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4A6CF7;">Bem-vindo ao Meu Residencial!</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">Olá, <strong>${nomeRepresentante}</strong>!</p>
        
        <p style="font-size: 16px; line-height: 1.5;">Obrigado por cadastrar ${nomeCondo} em nossa plataforma. É com grande satisfação que recebemos você como novo cliente!</p>
        
        <p style="font-size: 16px; line-height: 1.5;">Segue abaixo suas informações de acesso:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Usuário:</strong> ${matricula}</p>
          <p style="margin: 5px 0;"><strong>Senha:</strong> ${senha}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">Você pode acessar o sistema a qualquer momento através do link: <a href="https://meuresidencial.vercel.app" style="color: #4A6CF7;">meuresidencial.vercel.app</a></p>
        
        <p style="font-size: 16px; line-height: 1.5;">Se tiver qualquer dúvida ou precisar de suporte, entre em contato conosco pelo e-mail: <a href="mailto:suporte@meuresidencial.com" style="color: #4A6CF7;">suporte@meuresidencial.com</a></p>
        
        <p style="font-size: 16px; line-height: 1.5;">Atenciosamente,</p>
        <p style="font-size: 16px; line-height: 1.5;"><strong>Equipe Meu Residencial</strong></p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    console.log('Tentando enviar e-mail...');
    
    // Enviar e-mail utilizando denomailer
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: emailLegal,
      subject: `Bem-vindo ao Meu Residencial - Detalhes de acesso para ${nomeCondo}`,
      html: emailHtml,
      headers: emailHeaders,
    });

    await client.close();

    console.log('E-mail de boas-vindas enviado com sucesso');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
