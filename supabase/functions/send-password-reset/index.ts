
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase-admin.ts';

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
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Processando solicitação de recuperação de senha para: ${email}`);

    // Buscar o gestor pelo email no banco de dados
    const { data: manager, error: managerError } = await supabaseAdmin
      .from('condominiums')
      .select('nome_responsavel, senha, emaillegal')
      .eq('emaillegal', email)
      .single();

    if (managerError || !manager) {
      console.error('Gestor não encontrado:', managerError);
      return new Response(
        JSON.stringify({ error: 'Email não encontrado no sistema.' }),
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Configure o cliente SMTP para envio de email
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');

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

    // Preparar o conteúdo do email
    const emailContent = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Suas credenciais de acesso</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:#fff;margin:0;font-size:24px}.content{padding:20px 30px;background-color:#fff}.credentials{background-color:#f7f7f7;border-radius:5px;padding:15px;margin:20px 0}.credentials p{margin:8px 0}.credentials strong{color:#4A6CF7}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>Recuperação de Senha</h1></div><div class="content"><p>Olá, ${manager.nome_responsavel}!</p><p>Recebemos uma solicitação para recuperação de sua senha do sistema Meu Residencial.</p><p>Segue abaixo suas credenciais de acesso:</p><div class="credentials"><p><strong>Email:</strong> ${email}</p><p><strong>Senha:</strong> ${manager.senha}</p></div><p>Por razões de segurança, recomendamos que você altere sua senha após o login.</p><p>Se você não solicitou esta recuperação de senha, por favor, entre em contato conosco imediatamente.</p></div><div class="footer">© 2024 Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Enviar email
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: email,
      subject: "Recuperação de Senha - Meu Residencial",
      html: emailContent,
    });

    await client.close();
    
    console.log('Email com a senha atual enviado com sucesso');

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
    console.error('Erro ao processar solicitação de recuperação de senha:', error);
    
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
