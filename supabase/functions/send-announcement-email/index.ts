
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
      console.error("Missing required fields:", { matricula, title, contentLength: content?.length });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Getting residents for matricula: ${matricula}`);

    // Get condominium name for better email content
    const { data: condominium, error: condoError } = await supabaseAdmin
      .from("condominiums")
      .select("nome_condominio")
      .eq("matricula", matricula)
      .single();

    if (condoError) {
      console.error("Error fetching condominium:", condoError);
    }

    const condoName = condominium?.nome_condominio || "seu condomínio";
    console.log(`Condominium name: ${condoName}`);

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
        JSON.stringify({ error: "Failed to fetch residents", details: residentsError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${residents.length} residents with emails: ${JSON.stringify(residents.map(r => r.email))}`);
    
    if (residents.length === 0) {
      console.log("No residents with email found for matricula:", matricula);
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

    try {
      // Configuração do cliente SMTP com melhores práticas de deliverability
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
        // Configure DKIM signing for improved deliverability
        pool: true,
        rateLimit: 2, // Reduced to avoid email provider throttling
        debug: true, // Enable debug logs
      });

      console.log("SMTP client configured successfully");

      // Improved email template with better formatting and structure
      const emailTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background-color:#f9f9f9;">
    <div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin:20px auto;background-color:#ffffff;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
        <div style="background-color:#4A6CF7;padding:25px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">${title}</h1>
        </div>
        <div style="padding:30px 25px;background-color:#fff;">
            <p style="margin-bottom:20px;font-size:16px;color:#444;">Prezado(a) morador(a) de ${condoName},</p>
            <div style="background-color:#f7f9fc;padding:20px;border-radius:6px;margin:25px 0;border-left:4px solid #4A6CF7;">${htmlContent}</div>
            <p style="margin-top:25px;font-size:16px;color:#444;">Atenciosamente,<br><strong>Administração do Condomínio</strong></p>
        </div>
        <div style="background-color:#f7f7f7;padding:20px;text-align:center;font-size:13px;color:#666;border-top:1px solid #e0e0e0;">
            <p>Este é um comunicado oficial do seu condomínio.<br>© ${new Date().getFullYear()} Meu Residencial. Todos os direitos reservados.</p>
            <p>Para não receber mais estes e-mails, entre em contato com a administração do condomínio.</p>
        </div>
    </div>
</body>
</html>`;

      // Send email to each resident with improved headers and error handling
      const emailPromises = residents.map(async (resident) => {
        if (!resident.email) {
          console.log("Skipping resident with no email");
          return null;
        }
        
        try {
          const recipientName = resident.nome_completo || "Morador";
          console.log(`Preparing to send email to: ${resident.email}`);

          const messageId = `<announcement-${Date.now()}-${Math.round(Math.random() * 10000)}@meuresidencial.com>`;
          
          // Set proper email headers to improve deliverability
          const result = await client.send({
            from: { 
              name: `Comunicados ${condoName}`, 
              address: "noreply@meuresidencial.com" 
            },
            to: { 
              name: recipientName, 
              address: resident.email 
            },
            subject: `[${condoName}] ${title}`,
            html: emailTemplate,
            headers: {
              "Message-ID": messageId,
              "List-Unsubscribe": "<mailto:suporte@meuresidencial.com?subject=unsubscribe>",
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              "Precedence": "bulk",
              "X-Auto-Response-Suppress": "OOF, AutoReply",
              "Feedback-ID": `announcement:${matricula}:meuresidencial`,
              "X-Entity-Ref-ID": `${new Date().getTime()}`,
              "X-Report-Abuse": "Please report abuse here: mailto:suporte@meuresidencial.com",
              "X-Mailer": "Meu Residencial Mailer",
              "X-Priority": "3",
            },
            importance: "normal",
          });
          
          console.log(`Successfully sent email to ${resident.email} with status:`, result);
          return resident.email;
        } catch (emailError) {
          console.error(`Error sending email to ${resident.email}:`, emailError);
          return null;
        }
      });

      // Wait for all emails to be sent and collect results
      console.log("Waiting for all emails to be sent...");
      const emailResults = await Promise.all(emailPromises);
      const successfulEmails = emailResults.filter(Boolean);
      
      // Close SMTP connection
      console.log("Closing SMTP connection...");
      await client.close();
      
      console.log(`Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`);
      console.log("Successful emails:", successfulEmails);

      return new Response(
        JSON.stringify({ 
          message: `Successfully sent ${successfulEmails.length} emails out of ${residents.length} residents`,
          successfulEmails
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (smtpError) {
      console.error("SMTP client error:", smtpError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send emails", 
          details: smtpError.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("General error in send-announcement-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        trace: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
