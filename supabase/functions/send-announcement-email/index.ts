
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

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

    // Configuração do cliente SMTP - using the same credentials as in "Fale Conosco"
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
      // Add DKIM configuration
      pool: 5,
      dkim: {
        domainName: "meuresidencial.com",
        keySelector: "default",
        privateKey: Deno.env.get("DKIM_PRIVATE_KEY") || "",
      },
    });

    // Email template for announcements
    const emailTemplate = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#4A6CF7;padding:20px;text-align:center}.header h1{color:white;margin:0;font-size:24px}.content{padding:20px;background-color:#fff}.message-box{background-color:#f7f7f7;padding:15px;border-radius:6px;margin-top:10px}.footer{background-color:#f7f7f7;padding:15px;text-align:center;font-size:12px;color:#666;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>${title}</h1></div><div class="content"><div class="message-box">${htmlContent}</div></div><div class="footer">Este é um comunicado oficial do seu condomínio.<br>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Add email authentication headers
    const emailHeaders = {
      // SPF is handled at DNS level, but we can add Return-Path for alignment
      "Return-Path": "noreply@meuresidencial.com",
      // Additional headers to improve deliverability
      "X-Mailer": "Meu Residencial System",
      "List-Unsubscribe": "<mailto:unsubscribe@meuresidencial.com>",
      // DMARC alignment is enforced by ensuring From header matches domain with SPF/DKIM records
    };

    // Send email to each resident
    const emailPromises = residents.map(async (resident) => {
      if (!resident.email) return null;
      
      try {
        console.log(`Sending email to: ${resident.email}`);
        await client.send({
          from: "Comunicados <noreply@meuresidencial.com>",
          to: resident.email,
          subject: title,
          html: emailTemplate,
          headers: emailHeaders,
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
