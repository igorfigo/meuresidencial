
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementEmailRequest {
  matricula: string;
  title: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matricula, title, content }: AnnouncementEmailRequest = await req.json();

    if (!matricula || !title || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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

    // Create an HTML version of the content with proper formatting
    const htmlContent = content.replace(/\n/g, "<br>");

    // Send email to each resident
    const emailPromises = residents.map(async (resident) => {
      if (!resident.email) return null;
      
      try {
        console.log(`Sending email to: ${resident.email}`);
        return await resend.emails.send({
          from: "Comunicados <onboarding@resend.dev>",
          to: [resident.email],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${title}</h2>
              <div style="margin-top: 20px; line-height: 1.5;">
                ${htmlContent}
              </div>
              <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                Este é um comunicado oficial do seu condomínio.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(`Error sending email to ${resident.email}:`, emailError);
        return null;
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(Boolean);

    console.log(`Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-announcement-email function:", error);
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
