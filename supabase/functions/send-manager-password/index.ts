
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  identifier: string;  // Could be an email or matricula
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the user's identifier (email or matricula)
    const { identifier }: PasswordResetRequest = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "Identificador não fornecido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Buscando informações para: ${identifier}`);

    // Try to find the condominium by email or matricula
    const { data: condominium, error } = await supabaseAdmin
      .from("condominiums")
      .select("senha, emaillegal, nomecondominio, nomelegal, matricula")
      .or(`emaillegal.eq.${identifier},matricula.eq.${identifier}`)
      .single();

    if (error || !condominium) {
      console.error("Erro ao buscar informações do condomínio:", error);
      return new Response(
        JSON.stringify({ error: "Email ou matrícula não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if we have an email to send to
    if (!condominium.emaillegal) {
      return new Response(
        JSON.stringify({ error: "Email não cadastrado para este condomínio" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if we have a password to send
    if (!condominium.senha) {
      return new Response(
        JSON.stringify({ error: "Senha não cadastrada para este condomínio" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Enviando email para: ${condominium.emaillegal}`);

    // Send the email with the password
    const emailResponse = await resend.emails.send({
      from: "MeuResidencial <noreply@meuresidencial.com>",
      to: [condominium.emaillegal],
      subject: "Sua senha do MeuResidencial",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #2a52be; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="color: white; margin: 0;">MeuResidencial</h1>
          </div>
          <div style="padding: 20px;">
            <p>Olá ${condominium.nomelegal || "Síndico"},</p>
            <p>Você solicitou sua senha para acessar o sistema MeuResidencial.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px;">Matrícula:</p>
              <p style="font-weight: bold; font-size: 18px; margin: 5px 0;">${condominium.matricula}</p>
              <p style="margin: 10px 0 0; font-size: 14px;">Senha:</p>
              <p style="font-weight: bold; font-size: 18px; margin: 5px 0;">${condominium.senha}</p>
            </div>
            <p>Por motivos de segurança, recomendamos que você altere sua senha após o login.</p>
            <p>Atenciosamente,<br>Equipe MeuResidencial</p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Erro ao enviar email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email: " + emailResponse.error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ message: "Email com senha enviado com sucesso" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro na função send-manager-password:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar solicitação: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
