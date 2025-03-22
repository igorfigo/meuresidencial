
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  matricula: string;
  month: string;
  monthName: string;
  balance: string;
  totalIncome: string;
  totalExpense: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matricula, month, monthName, balance, totalIncome, totalExpense }: ReportRequest = await req.json();

    // Get residents with email for this condominium
    const { data: residents, error: residentsError } = await supabaseAdmin
      .from('residents')
      .select('id, nome_completo, email, unidade')
      .eq('matricula', matricula)
      .not('email', 'is', null);
    
    if (residentsError) {
      console.error("Error fetching residents:", residentsError);
      throw new Error(`Failed to fetch residents: ${residentsError.message}`);
    }

    const validResidents = residents
      ?.filter(resident => resident.email && resident.email.includes('@')) || [];
    
    const validEmails = validResidents.map(resident => resident.email);

    if (validEmails.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Não foi encontrado nenhum morador com email cadastrado." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get condominium name
    const { data: condominium, error: condominiumError } = await supabaseAdmin
      .from('condominiums')
      .select('nomecondominio')
      .eq('matricula', matricula)
      .single();
    
    if (condominiumError) {
      console.error("Error fetching condominium:", condominiumError);
      throw new Error(`Failed to fetch condominium: ${condominiumError.message}`);
    }

    const condominiumName = condominium?.nomecondominio || "Seu Condomínio";

    // Calculate result
    const incomeValue = parseFloat(totalIncome.replace('.', '').replace(',', '.')) || 0;
    const expenseValue = parseFloat(totalExpense.replace('.', '').replace(',', '.')) || 0;
    const result = incomeValue - expenseValue;
    const isPositive = result >= 0;

    // Build email HTML
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <div style="background-color: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Prestação de Contas - ${monthName}</h2>
        </div>
        
        <div style="padding: 20px;">
          <p>Prezados moradores do <strong>${condominiumName}</strong>,</p>
          
          <p>Segue abaixo a prestação de contas do mês de <strong>${monthName}</strong>:</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #e4e4e4; border-radius: 5px; padding: 15px; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e4e4e4; padding-bottom: 8px;">
              <span style="color: #4b5563;">Receitas:</span>
              <span style="color: #059669; font-weight: bold;">R$ ${totalIncome}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e4e4e4; padding-bottom: 8px;">
              <span style="color: #4b5563;">Despesas:</span>
              <span style="color: #dc2626; font-weight: bold;">R$ ${totalExpense}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e4e4e4; padding-bottom: 8px;">
              <span style="color: #4b5563;">Resultado:</span>
              <span style="color: ${isPositive ? '#059669' : '#dc2626'}; font-weight: bold;">
                R$ ${isPositive ? result.toFixed(2).replace('.', ',') : (result * -1).toFixed(2).replace('.', ',')}
                ${isPositive ? ' (positivo)' : ' (negativo)'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #4b5563;">Saldo Atual:</span>
              <span style="color: #3b82f6; font-weight: bold;">R$ ${balance}</span>
            </div>
          </div>
          
          <p>Para mais detalhes, acesse a área do morador em nosso sistema.</p>
          
          <p style="margin-top: 20px;">Atenciosamente,<br>Administração do ${condominiumName}</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px;">
          <p>Este é um email automático enviado pelo sistema Meu Residencial.</p>
        </div>
      </div>
    `;

    // Configure SMTP client - using the same configuration as "Fale Conosco"
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

    // Send email to each resident
    const emailPromises = validResidents.map(async (resident) => {
      try {
        console.log(`Sending report email to: ${resident.email} (${resident.unidade})`);
        await client.send({
          from: `${condominiumName} <noreply@meuresidencial.com>`,
          to: resident.email,
          subject: `Prestação de Contas - ${monthName} - ${condominiumName}`,
          html: emailContent,
        });
        return resident;
      } catch (emailError) {
        console.error(`Error sending email to ${resident.email}:`, emailError);
        return null;
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(Boolean);
    
    // Collect units that received emails successfully
    const units = successfulEmails
      .filter(r => r && r.unidade)
      .map(r => r.unidade)
      .join(', ');

    await client.close();
    
    console.log(`Successfully sent reports to ${successfulEmails.length} residents out of ${validResidents.length}`);
    
    // Log in database with reference month and units info
    const { data: logData, error: logError } = await supabaseAdmin
      .from('accounting_report_logs')
      .insert({
        report_month: month,
        matricula,
        sent_via: 'email',
        sent_count: successfulEmails.length,
        units: units || null
      })
      .select();
    
    if (logError) {
      console.error("Error logging report:", logError);
      throw new Error(`Failed to log report: ${logError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Relatório enviado com sucesso para ${successfulEmails.length} moradores.`,
        recipients: successfulEmails.length,
        units: units,
        logId: logData?.[0]?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-accounting-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
