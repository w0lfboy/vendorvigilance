import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  organizationName: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, organizationName, userName }: WelcomeEmailRequest = await req.json();
    
    const senderEmail = Deno.env.get("SENDER_EMAIL") || "onboarding@resend.dev";
    const companyName = Deno.env.get("COMPANY_NAME") || "VendorShield";
    const appUrl = Deno.env.get("APP_URL") || "https://vendorshield.app";

    console.log(`Sending welcome email to ${email} for organization ${organizationName}`);

    const emailResponse = await resend.emails.send({
      from: `${companyName} <${senderEmail}>`,
      to: [email],
      subject: `Welcome to ${companyName} - Your organization is ready! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${companyName}!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi${userName ? ` ${userName}` : ''},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Congratulations! Your organization <strong>"${organizationName}"</strong> has been created successfully. You're now ready to start managing your vendor risk assessments.
            </p>
            
            <h2 style="color: #667eea; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">🚀 Getting Started</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 12px;">
                  <strong>Add Your First Vendor</strong><br>
                  <span style="color: #6b7280;">Navigate to Vendors and click "Add Vendor" to start tracking your third-party relationships.</span>
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Send a Security Assessment</strong><br>
                  <span style="color: #6b7280;">Create and send your first security questionnaire to evaluate vendor risk.</span>
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Invite Your Team</strong><br>
                  <span style="color: #6b7280;">Go to Settings → Team to invite colleagues to collaborate on vendor management.</span>
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Customize Your Organization</strong><br>
                  <span style="color: #6b7280;">Upload your logo and configure settings to personalize your workspace.</span>
                </li>
              </ol>
            </div>
            
            <h2 style="color: #667eea; font-size: 20px; margin-top: 30px; margin-bottom: 15px;">💡 Pro Tips</h2>
            
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li style="margin-bottom: 8px;">Use the AI-powered analysis to automatically identify risks in vendor responses</li>
              <li style="margin-bottom: 8px;">Set up recurring assessments for continuous monitoring</li>
              <li style="margin-bottom: 8px;">Track remediation progress with the issue management system</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
              Need help? Reply to this email or check out our documentation.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
