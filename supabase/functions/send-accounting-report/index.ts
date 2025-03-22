
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

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
      pdfUrl, 
      monthName, 
      year, 
      totalIncome, 
      totalExpense, 
      balance,
      sendVia
    } = await req.json();

    console.log(`Recebendo solicitação para enviar prestação de contas para matrícula: ${matricula}`);
    console.log(`Método de envio: ${sendVia}`);

    // Get residents for the condominium
    const { data: residents, error: residentsError } = await supabaseAdmin
      .from('residents')
      .select('nome_completo, email, unidade')
      .eq('matricula', matricula)
      .not('email', 'is', null)
      .not('email', 'eq', '');

    if (residentsError) {
      console.error("Erro ao buscar moradores:", residentsError);
      throw new Error(`Erro ao buscar moradores: ${residentsError.message}`);
    }

    if (!residents || residents.length === 0) {
      console.log("Nenhum morador encontrado com email cadastrado");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Nenhum morador encontrado com email cadastrado" 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`Encontrados ${residents.length} moradores com email cadastrado`);

    // Get condominium name
    const { data: condominium, error: condominiumError } = await supabaseAdmin
      .from('condominiums')
      .select('nomecondominio')
      .eq('matricula', matricula)
      .single();

    if (condominiumError) {
      console.error("Erro ao buscar informações do condomínio:", condominiumError);
      throw new Error(`Erro ao buscar informações do condomínio: ${condominiumError.message}`);
    }

    const condominiumName = condominium?.nomecondominio || "Seu Condomínio";

    // Process emails based on sendVia
    if (sendVia === 'email') {
      try {
        // Configuração do cliente SMTP - usando as mesmas configurações do fale conosco
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

        // Create a list of units to record which ones received the email
        const sentUnits = residents.map(resident => resident.unidade);

        // Send emails to all residents
        await Promise.all(residents.map(async (resident) => {
          try {
            // Create email content
            const emailContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prestação de Contas - ${monthName} ${year}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .container { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background-color: #4A6CF7; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 20px; background-color: #fff; }
    .section { margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
    .section:last-child { border-bottom: none; margin-bottom: 0; }
    .info-item { margin-bottom: 8px; }
    .info-label { font-weight: bold; }
    .button { display: inline-block; background-color: #4A6CF7; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; }
    .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    .summary-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 15px; }
    .income { color: #16a34a; }
    .expense { color: #dc2626; }
    .balance { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prestação de Contas - ${monthName} ${year}</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>${resident.nome_completo}</strong>!</p>
      <p>Segue a prestação de contas do nosso condomínio referente ao mês de <strong>${monthName} de ${year}</strong>.</p>
      
      <div class="summary-box">
        <div class="info-item">
          <span class="info-label">Total de Receitas:</span> 
          <span class="income">R$ ${totalIncome}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total de Despesas:</span> 
          <span class="expense">R$ ${totalExpense}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Saldo Final:</span> 
          <span class="balance">R$ ${balance}</span>
        </div>
      </div>
      
      <p>Para visualizar o relatório completo, clique no link abaixo:</p>
      <a href="${pdfUrl}" class="button" target="_blank">Visualizar Relatório Completo</a>
      
      <p style="margin-top: 20px;">Caso tenha alguma dúvida, entre em contato com a administração do condomínio.</p>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo sistema <a href="https://www.meuresidencial.com" style="color: #4A6CF7;">Meu Residencial</a>.</p>
      <p>© 2024 Meu Residencial - Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;

            // Send email
            await client.send({
              from: `${condominiumName} <noreply@meuresidencial.com>`,
              to: resident.email,
              subject: `Prestação de Contas - ${condominiumName} - ${monthName} ${year}`,
              html: emailContent,
            });

            console.log(`Email enviado com sucesso para ${resident.nome_completo} (${resident.email})`);
          } catch (error) {
            console.error(`Erro ao enviar email para ${resident.email}:`, error);
          }
        }));

        // Close SMTP connection
        await client.close();

        // Log this report sending in the database
        const { error: logError } = await supabaseAdmin
          .from('accounting_report_logs')
          .insert({
            matricula,
            report_month: `${year}-${monthName}`,
            sent_via: 'email',
            sent_count: residents.length,
            sent_units: sentUnits.join(', ')
          });

        if (logError) {
          console.error("Erro ao registrar envio:", logError);
        }

        console.log('Todos os emails foram enviados com sucesso');

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Prestação de contas enviada com sucesso para ${residents.length} moradores via email.`,
            sentUnits
          }),
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      } catch (error) {
        console.error('Erro ao enviar emails:', error);
        throw new Error(`Erro ao enviar emails: ${error.message}`);
      }
    } else if (sendVia === 'whatsapp') {
      // For now, we'll just return that WhatsApp is not implemented
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Envio por WhatsApp ainda não está implementado." 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } else {
      throw new Error("Método de envio inválido");
    }
  } catch (error) {
    console.error('Erro ao enviar prestação de contas:', error);
    
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
