
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAccountingReportRequest {
  to: string[];
  subject: string;
  htmlContent: string;
  reportMonth: string;
  matricula: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      subject,
      htmlContent,
      reportMonth,
      matricula,
    }: SendAccountingReportRequest = await req.json();

    if (!to || to.length === 0) {
      return new Response(
        JSON.stringify({ error: "Recipient list cannot be empty" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email with the accounting report in the body
    const emailResponse = await resend.emails.send({
      from: "Meu Residencial <onboarding@resend.dev>",
      to,
      subject,
      html: htmlContent,
    });

    console.log("Accounting report email sent successfully:", emailResponse);
    
    // Log the sending operation in the database
    const { supabaseClient } = await import("../../../supabase/functions/_shared/supabase-admin.ts");
    
    await supabaseClient
      .from("accounting_report_logs")
      .insert({
        sent_via: "email",
        report_month: reportMonth,
        matricula: matricula,
        sent_units: JSON.stringify(to),
        sent_count: to.length,
      });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
