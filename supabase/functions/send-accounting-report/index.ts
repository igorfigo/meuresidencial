
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AccountingReportRequest {
  matricula: string;
  month: string;
  monthName: string;
  year: string;
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
    const { matricula, month, monthName, year, balance, totalIncome, totalExpense }: AccountingReportRequest = await req.json();

    if (!matricula || !month || !year) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Getting condominium info for matricula: ${matricula}`);
    
    // Fetch condominium name
    const { data: condominium, error: condominiumError } = await supabaseAdmin
      .from("condominiums")
      .select("nomecondominio")
      .eq("matricula", matricula)
      .single();

    if (condominiumError) {
      console.error("Error fetching condominium:", condominiumError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch condominium" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const condominiumName = condominium?.nomecondominio || "Seu Condomínio";
    console.log(`Condominium name: ${condominiumName}`);

    console.log(`Getting residents for matricula: ${matricula}`);

    // Get all residents with email for this condominium
    const { data: residents, error: residentsError } = await supabaseAdmin
      .from("residents")
      .select("email, nome_completo")
      .eq("matricula", matricula)
      .not("email", "is", null)
      .not("email", "eq", "");

    if (residentsError) {
      console.error("Error fetching residents:", residentsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch residents" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${residents.length} residents with emails`);
    
    if (residents.length === 0) {
      return new Response(
        JSON.stringify({ message: "No residents with email found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the email HTML content
    const emailTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prestação de Contas - ${monthName} ${year}</title>
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
      background: linear-gradient(135deg, #4A6CF7, #4A90E2);
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .header h2 {
      color: white;
      margin: 8px 0 0;
      font-size: 18px;
      font-weight: normal;
    }
    .content {
      padding: 20px;
      background-color: #fff;
    }
    .summary {
      background-color: #f7f9fc;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eaeaea;
    }
    .summary-row:last-child {
      border-bottom: none;
      font-weight: bold;
    }
    .footer {
      background-color: #f7f7f7;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .highlight-positive {
      color: #16a34a;
    }
    .highlight-negative {
      color: #dc2626;
    }
    .button {
      display: inline-block;
      background-color: #4A6CF7;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prestação de Contas</h1>
      <h2>${monthName} ${year}</h2>
    </div>
    <div class="content">
      <p>Prezado(a) morador(a),</p>
      <p>Segue abaixo a prestação de contas do condomínio referente ao mês de ${monthName} de ${year}:</p>
      
      <div class="summary">
        <div class="summary-row">
          <span>Total de Receitas:</span>
          <span class="highlight-positive">R$ ${totalIncome}</span>
        </div>
        <div class="summary-row">
          <span>Total de Despesas:</span>
          <span class="highlight-negative">R$ ${totalExpense}</span>
        </div>
        <div class="summary-row">
          <span>Saldo Final:</span>
          <span>R$ ${balance}</span>
        </div>
      </div>
      
      <p>Para visualizar o relatório completo com todas as receitas e despesas do mês, acesse a sua conta no portal do condomínio.</p>
      
      <div style="text-align: center;">
        <a href="https://meuresidencial.com" class="button">Acessar Portal</a>
      </div>
    </div>
    <div class="footer">
      <p>Este é um comunicado oficial do seu condomínio.</p>
      <p>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;

    // Configure SMTP client - using the same credentials as in "Fale Conosco" function
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
    const emailPromises = residents.map(async (resident) => {
      if (!resident.email) return null;
      
      try {
        console.log(`Sending email to: ${resident.email}`);
        await client.send({
          from: `${condominiumName} <noreply@meuresidencial.com>`,
          to: resident.email,
          subject: `Prestação de Contas - ${monthName} ${year}`,
          html: emailTemplate,
        });
        return resident.email;
      } catch (emailError) {
        console.error(`Error sending email to ${resident.email}:`, emailError);
        return null;
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(Boolean);

    await client.close();
    
    console.log(`Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`);

    // Log the report sending to the database
    const { data: reportLog, error: reportLogError } = await supabaseAdmin
      .from("accounting_report_logs")
      .insert({
        matricula,
        report_month: `${year}-${month}`,
        sent_via: "email",
        sent_count: successfulEmails.length,
        created_at: new Date().toISOString()
      })
      .select();

    if (reportLogError) {
      console.error("Error logging report delivery:", reportLogError);
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`,
        log: reportLog
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

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

serve(handler);
