
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";
import { decode } from "https://deno.land/std@0.173.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendReportRequest {
  matricula: string;
  report_month: string;
  report_year: string;
  report_data: string; // Base64 encoded PDF
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matricula, report_month, report_year, report_data }: SendReportRequest = await req.json();

    if (!matricula || !report_month || !report_year || !report_data) {
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
      .select("email, nome_completo, unidade")
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

    // Convert base64 to binary for attachment
    const binaryPdf = decode(report_data.split(';base64,').pop() || "");
    
    // Configure SMTP client
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

    // Create email HTML template
    const makeEmailTemplate = (residentName: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prestação de Contas</title>
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
    .footer {
      background-color: #f7f7f7;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prestação de Contas - ${report_month}/${report_year}</h1>
      <h2>${condominiumName}</h2>
    </div>
    <div class="content">
      <p>Olá, ${residentName}!</p>
      <p>Segue em anexo a prestação de contas do condomínio referente ao mês de ${report_month}/${report_year}.</p>
      <p>Este é um informativo oficial enviado pelo síndico ou administrador do seu condomínio através do sistema Meu Residencial.</p>
      <p>Qualquer dúvida entre em contato com a administração do condomínio.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.
    </div>
  </div>
</body>
</html>`;

    // Send email to each resident
    const emailPromises = residents.map(async (resident) => {
      if (!resident.email) return null;
      
      try {
        console.log(`Sending email to: ${resident.email}`);
        await client.send({
          from: `${condominiumName} <noreply@meuresidencial.com>`,
          to: resident.email,
          subject: `${condominiumName}: Prestação de Contas - ${report_month}/${report_year}`,
          html: makeEmailTemplate(resident.nome_completo),
          attachments: [
            {
              content: binaryPdf,
              filename: `Prestacao_Contas_${report_month}_${report_year}.pdf`,
              contentType: "application/pdf",
            },
          ],
        });
        return resident;
      } catch (emailError) {
        console.error(`Error sending email to ${resident.email}:`, emailError);
        return null;
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(Boolean);
    
    // Create a comma-separated list of units that received the report
    const sentUnits = successfulEmails
      .map(resident => resident?.unidade)
      .filter(Boolean)
      .join(", ");

    await client.close();
    
    console.log(`Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`);

    // Log the report distribution
    const { error: logError } = await supabaseAdmin
      .from("accounting_report_logs")
      .insert({
        matricula,
        report_month: `${report_month}/${report_year}`,
        sent_via: "email",
        sent_units: sentUnits,
        sent_count: successfulEmails.length
      });

    if (logError) {
      console.error("Error logging report distribution:", logError);
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`,
        sent_count: successfulEmails.length,
        sent_units: sentUnits
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
