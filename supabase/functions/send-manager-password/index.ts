
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
    const { matricula, email, nome } = await req.json();

    // Generate a random password
    const password = generateRandomPassword();

    console.log(`Sending password to manager with matricula: ${matricula}`);

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

    // Email template for manager password
    const emailContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Senha de Acesso do Síndico</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
        }
        .container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #4A6CF7;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            background-color: #fff;
        }
        .section {
            margin-bottom: 20px;
        }
        .password-container {
            background-color: #f7f7f7;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            text-align: center;
        }
        .password {
            font-size: 24px;
            font-weight: bold;
            color: #4A6CF7;
            letter-spacing: 1px;
        }
        .footer {
            background-color: #f7f7f7;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #4A6CF7;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Senha de Acesso</h1>
        </div>
        <div class="content">
            <div class="section">
                <h2>Olá, ${nome || 'Gestor'}!</h2>
                <p>Este é seu acesso ao sistema Meu Residencial com sua senha temporária.</p>
                <p>Por favor, anote esta senha e guarde-a em um local seguro.</p>
            </div>
            
            <div class="section">
                <h3>Seus dados de acesso:</h3>
                <p><strong>Matrícula:</strong> ${matricula}</p>
                <p><strong>Email:</strong> ${email}</p>
                <div class="password-container">
                    <p>Sua senha:</p>
                    <div class="password">${password}</div>
                </div>
            </div>
            
            <div class="section">
                <p>Para acessar o sistema, visite: <a href="https://app.meuresidencial.com">app.meuresidencial.com</a></p>
                <p>Recomendamos alterar esta senha após o primeiro login por questão de segurança.</p>
            </div>
        </div>
        <div class="footer">
            &copy; 2024 Meu Residencial. Todos os direitos reservados.<br>
            Este é um e-mail automático, por favor não responda.
        </div>
    </div>
</body>
</html>`;

    // Envio do email
    await client.send({
      from: "Meu Residencial <noreply@meuresidencial.com>",
      to: email,
      subject: "Sua senha de acesso - Meu Residencial",
      html: emailContent,
    });

    await client.close();
    
    console.log('Senha enviada com sucesso para o gestor');

    return new Response(
      JSON.stringify({ success: true, password }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Erro ao enviar senha:', error);
    
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

// Function to generate a random password
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
