
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

interface SendReportRequest {
  matricula: string;
  month: string;
  reportHtml: string;
  monthLabel: string;
  condominiumName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const resend = new Resend(resendApiKey);
    const { matricula, month, reportHtml, monthLabel, condominiumName }: SendReportRequest = await req.json();

    // Fetch resident emails from the residents table
    const { data: residents, error: residentsError } = await supabase
      .from('residents')
      .select('email, nome_completo')
      .eq('matricula', matricula)
      .not('email', 'is', null)
      .not('email', 'eq', '');

    if (residentsError) {
      throw new Error(`Error fetching residents: ${residentsError.message}`);
    }

    if (!residents || residents.length === 0) {
      throw new Error("No residents with email found for this condominium");
    }

    console.log(`Found ${residents.length} residents with email addresses`);

    // Send emails to all residents
    const emailPromises = residents.map(async (resident) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "Meu Residencial <noreply@meuresidencial.com>",
          to: [resident.email],
          subject: `Prestação de Contas - ${monthLabel} - ${condominiumName}`,
          html: reportHtml,
        });

        console.log(`Email sent to ${resident.email}: ${JSON.stringify(emailResponse)}`);
        return { success: true, email: resident.email, residentName: resident.nome_completo };
      } catch (emailError) {
        console.error(`Failed to send email to ${resident.email}:`, emailError);
        return { success: false, email: resident.email, error: emailError.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    
    // Log the email sending activity
    const successfulSends = emailResults.filter(result => result.success).length;
    
    await supabase
      .from('accounting_report_logs')
      .insert({
        matricula,
        reference_month: month,
        type: 'email',
        recipients_count: successfulSends,
        status: successfulSends > 0 ? 'success' : 'failed',
        details: JSON.stringify(emailResults)
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Relatório enviado com sucesso para ${successfulSends} de ${residents.length} moradores`,
        details: emailResults
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending accounting report:", error);
    
    // Log the error
    try {
      const { matricula, month } = await req.json();
      if (matricula && month) {
        await supabase
          .from('accounting_report_logs')
          .insert({
            matricula,
            reference_month: month,
            type: 'email',
            recipients_count: 0,
            status: 'failed',
            details: JSON.stringify({ error: error.message })
          });
      }
    } catch (logError) {
      console.error("Error logging failure:", logError);
    }
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
