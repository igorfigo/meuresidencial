
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
    });

    // Updated email template with the specified brand colors
    // #2151B9 (primary blue) - Used for header background
    // #EFEFEF (light gray) - Used for background and content box
    // #103381 (dark blue) - Used for title text
    // #295AC3 (medium blue) - Not specifically used in this template but could be for highlights
    // #FFFFFF (white) - Used for text on dark backgrounds
    // #000000 (black) - Used for content text
    const emailTemplate = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#000000;max-width:600px;margin:0 auto}.container{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}.header{background-color:#2151B9;padding:20px;text-align:center}.header h1{color:#FFFFFF;margin:0;font-size:24px}.header h2{color:#FFFFFF;margin:8px 0 0;font-size:18px;font-weight:normal}.content{padding:20px;background-color:#FFFFFF}.message-box{background-color:#EFEFEF;padding:15px;border-radius:6px;margin-top:10px}.footer{background-color:#EFEFEF;padding:15px;text-align:center;font-size:12px;color:#103381;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>${title}</h1><h2>${condominiumName}</h2></div><div class="content"><div class="message-box">${htmlContent}</div></div><div class="footer">Este é um comunicado oficial do seu condomínio.<br>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</div></div></body></html>`;

    // Send email to each resident
    const emailPromises = residents.map(async (resident) => {
      if (!resident.email) return null;
      
      try {
        console.log(`Sending email to: ${resident.email}`);
        await client.send({
          from: `${condominiumName} <noreply@meuresidencial.com>`,
          to: resident.email,
          subject: `${condominiumName}: ${title}`,
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
