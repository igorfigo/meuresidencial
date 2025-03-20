
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    const emailResponse = await resend.emails.send({
      from: 'Meu Residencial <onboarding@resend.dev>',
      to: [emailLegal],
      subject: `Bem-vindo ao Meu Residencial - Detalhes de acesso para ${nomeCondo}`,
      html: `
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
            <p>© 2024 Meu Residencial. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
    });

    console.log('Email enviado com sucesso:', emailResponse);

    return new Response(
      JSON.stringify(emailResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
