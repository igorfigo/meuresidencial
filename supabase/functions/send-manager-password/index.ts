
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PasswordRecoveryRequest {
  identifier: string; // can be email or matricula
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service configuration is missing" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { identifier }: PasswordRecoveryRequest = await req.json();
    
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "Email or matricula is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Query by either email or matricula
    const { data: condominium, error } = await supabase
      .from("condominiums")
      .select("matricula, nomecondominio, nomelegal, emaillegal, senha")
      .or(`emaillegal.eq.${identifier},matricula.eq.${identifier}`)
      .single();

    if (error || !condominium) {
      console.error("Error fetching condominium:", error);
      return new Response(
        JSON.stringify({ 
          error: "Manager not found. Please check your email or matricula." 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!condominium.emaillegal || !condominium.senha) {
      return new Response(
        JSON.stringify({ 
          error: "Email or password not set for this manager" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Send email with the password
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "MeuResidencial <noreply@meuresidencial.com.br>",
      to: [condominium.emaillegal],
      subject: "Recuperação de Senha - MeuResidencial",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; padding: 10px 0; background-color: #3b5fc7; color: white; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">MeuResidencial</h1>
          </div>
          <div style="padding: 20px;">
            <p>Olá, ${condominium.nomelegal || "Síndico"}!</p>
            <p>Você solicitou a recuperação de senha para o condomínio <strong>${condominium.nomecondominio || condominium.matricula}</strong>.</p>
            <p>Sua senha atual é: <strong>${condominium.senha}</strong></p>
            <p>Por motivos de segurança, recomendamos que você altere sua senha após o login.</p>
            <p>Se você não solicitou esta recuperação, por favor ignore este email.</p>
            <p>Atenciosamente,<br>Equipe MeuResidencial</p>
          </div>
          <div style="text-align: center; padding: 10px; background-color: #f0f0f0; color: #666; font-size: 12px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0;">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Password recovery email sent successfully",
        email: condominium.emaillegal 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
