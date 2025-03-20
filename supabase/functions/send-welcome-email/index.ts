
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
      console.error("Missing required email:", emailLegal);
      return new Response(
        JSON.stringify({ error: 'O e-mail do representante legal é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enviando e-mail de boas-vindas para: ${emailLegal}`);

    const nomeCondo = nomeCondominio || 'seu condomínio';
    const nomeRepresentante = nomelegal || 'Representante Legal';

    try {
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
        rateLimit: 2,
        debug: true, // Enable debug logs
      });

      // HTML Template melhorado para evitar filtros de spam
      const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Meu Residencial</title>
</head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background-color:#f5f5f5;color:#333333;">
    <div style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);overflow:hidden;">
        <div style="background-color:#4A6CF7;padding:30px 20px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bem-vindo ao Meu Residencial!</h1>
        </div>
        
        <div style="padding:30px 25px;">
            <p style="font-size:16px;line-height:1.5;margin-bottom:25px;">Olá, <strong>${nomeRepresentante}</strong>!</p>
            
            <p style="font-size:16px;line-height:1.5;margin-bottom:25px;">Obrigado por cadastrar ${nomeCondo} em nossa plataforma. É com grande satisfação que recebemos você como novo cliente!</p>
            
            <p style="font-size:16px;line-height:1.5;margin-bottom:15px;">Segue abaixo suas informações de acesso:</p>
            
            <div style="background-color:#f8f9fa;border-left:4px solid #4A6CF7;padding:15px 20px;margin:20px 0;border-radius:4px;">
                <p style="margin:5px 0;font-size:16px;"><strong>Usuário:</strong> ${matricula}</p>
                <p style="margin:5px 0;font-size:16px;"><strong>Senha:</strong> ${senha}</p>
            </div>
            
            <p style="font-size:16px;line-height:1.5;margin-bottom:25px;">Você pode acessar o sistema a qualquer momento através do link: <a href="https://meuresidencial.vercel.app" style="color:#4A6CF7;text-decoration:underline;font-weight:bold;">meuresidencial.vercel.app</a></p>
            
            <p style="font-size:16px;line-height:1.5;margin-bottom:15px;">Se tiver qualquer dúvida ou precisar de suporte, entre em contato conosco pelo e-mail: <a href="mailto:suporte@meuresidencial.com" style="color:#4A6CF7;text-decoration:underline;font-weight:bold;">suporte@meuresidencial.com</a></p>
            
            <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e0e0e0;">
                <p style="font-size:16px;line-height:1.5;margin:5px 0;">Atenciosamente,</p>
                <p style="font-size:16px;line-height:1.5;margin:5px 0;font-weight:bold;">Equipe Meu Residencial</p>
            </div>
        </div>
        
        <div style="text-align:center;background-color:#f7f7f7;padding:20px;font-size:13px;color:#666666;border-top:1px solid #e0e0e0;">
            <p>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</p>
            <p>Este e-mail foi enviado automaticamente, não é necessário respondê-lo.</p>
        </div>
    </div>
</body>
</html>`;

      const messageId = `<welcome-${Date.now()}-${Math.round(Math.random() * 10000)}@meuresidencial.com>`;

      // Send email with improved headers
      const result = await client.send({
        from: { name: "Meu Residencial", address: "noreply@meuresidencial.com" },
        to: { name: nomeRepresentante, address: emailLegal },
        subject: `Bem-vindo ao Meu Residencial - Detalhes de acesso para ${nomeCondo}`,
        html: emailHtml,
        headers: {
          "Message-ID": messageId,
          "List-Unsubscribe": "<mailto:suporte@meuresidencial.com?subject=unsubscribe>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "Precedence": "bulk",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
          "Feedback-ID": `welcome:meuresidencial`,
          "X-Entity-Ref-ID": `welcome-${new Date().getTime()}`,
          "X-Priority": "1",
          "X-Mailer": "Meu Residencial Mailer",
          "Importance": "high",
        },
        priority: "high"
      });

      console.log("Email sent with result:", result);
      await client.close();

      console.log('Email enviado com sucesso para:', emailLegal);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (smtpError) {
      console.error('Erro ao enviar e-mail de boas-vindas (SMTP):', smtpError);
      return new Response(
        JSON.stringify({ error: smtpError.message, details: "SMTP Error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    return new Response(
      JSON.stringify({ error: error.message, trace: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
