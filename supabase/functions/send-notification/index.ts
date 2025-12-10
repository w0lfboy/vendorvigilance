// =============================================================================
// VendorVigilance: Email Notification Edge Function
// Deploy to: supabase/functions/send-notification/index.ts
// =============================================================================
//
// SETUP INSTRUCTIONS:
// 1. Sign up at https://resend.com and get your API key
// 2. Verify your domain in Resend (or use their test domain for development)
// 3. Add the secret in Supabase:
//    - Go to Project Settings > Edge Functions > Secrets
//    - Add: RESEND_API_KEY = your_api_key
//    - Add: SENDER_EMAIL = notifications@yourdomain.com (or onboarding@resend.dev for testing)
//    - Add: APP_URL = https://your-app-url.com
// 4. Deploy: npx supabase functions deploy send-notification
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email templates
const templates = {
  // Assessment invitation email
  assessment_invite: (data: {
    vendorName: string;
    vendorContact: string;
    assessmentTitle: string;
    dueDate: string;
    portalLink: string;
    senderCompany: string;
  }) => ({
    subject: `Security Assessment Request: ${data.assessmentTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Assessment Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Security Assessment Request</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Hello ${data.vendorContact},</p>
    
    <p><strong>${data.senderCompany}</strong> has requested that you complete a security assessment as part of their vendor risk management process.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e3a5f;">Assessment Details</h3>
      <p style="margin: 8px 0;"><strong>Assessment:</strong> ${data.assessmentTitle}</p>
      <p style="margin: 8px 0;"><strong>Due Date:</strong> ${data.dueDate}</p>
      <p style="margin: 8px 0;"><strong>Vendor:</strong> ${data.vendorName}</p>
    </div>
    
    <p>Please click the button below to access the assessment portal and complete the questionnaire:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalLink}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Complete Assessment →
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      <strong>Note:</strong> You can save your progress and return later using the same link. 
      No login is required.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    
    <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
      This assessment is powered by VendorVigilance. If you have questions about this request, 
      please contact ${data.senderCompany} directly.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Security Assessment Request

Hello ${data.vendorContact},

${data.senderCompany} has requested that you complete a security assessment as part of their vendor risk management process.

Assessment Details:
- Assessment: ${data.assessmentTitle}
- Due Date: ${data.dueDate}
- Vendor: ${data.vendorName}

Please visit the following link to complete the assessment:
${data.portalLink}

Note: You can save your progress and return later using the same link. No login is required.

---
This assessment is powered by VendorVigilance.
    `,
  }),

  // Assessment reminder email
  assessment_reminder: (data: {
    vendorName: string;
    vendorContact: string;
    assessmentTitle: string;
    dueDate: string;
    daysRemaining: number;
    portalLink: string;
    progress: number;
    senderCompany: string;
  }) => ({
    subject: `Reminder: ${data.assessmentTitle} due ${data.daysRemaining <= 0 ? 'today' : `in ${data.daysRemaining} days`}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${data.daysRemaining <= 3 ? '#dc2626' : '#f59e0b'}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">
      ${data.daysRemaining <= 0 ? '⚠️ Assessment Due Today' : `📅 ${data.daysRemaining} Days Remaining`}
    </h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Hello ${data.vendorContact},</p>
    
    <p>This is a friendly reminder that your security assessment for <strong>${data.senderCompany}</strong> is due ${data.daysRemaining <= 0 ? 'today' : `on ${data.dueDate}`}.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e3a5f;">Current Progress</h3>
      <div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
        <div style="background: ${data.progress >= 100 ? '#22c55e' : '#2563eb'}; height: 100%; width: ${data.progress}%;"></div>
      </div>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">${data.progress}% complete</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalLink}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Continue Assessment →
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    
    <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
      If you've already completed this assessment, please disregard this email.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Assessment Reminder

Hello ${data.vendorContact},

This is a friendly reminder that your security assessment for ${data.senderCompany} is due ${data.daysRemaining <= 0 ? 'today' : `on ${data.dueDate}`}.

Current Progress: ${data.progress}% complete

Continue your assessment here:
${data.portalLink}

If you've already completed this assessment, please disregard this email.
    `,
  }),

  // Assessment submitted notification (to the assessment owner)
  assessment_submitted: (data: {
    vendorName: string;
    assessmentTitle: string;
    submittedDate: string;
    score: number | null;
    riskLevel: string | null;
    detailLink: string;
    recipientName: string;
  }) => ({
    subject: `✅ Assessment Submitted: ${data.vendorName} - ${data.assessmentTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Submitted</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #22c55e; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">✅ Assessment Submitted</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Hello ${data.recipientName},</p>
    
    <p><strong>${data.vendorName}</strong> has completed and submitted their security assessment.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e3a5f;">Submission Details</h3>
      <p style="margin: 8px 0;"><strong>Assessment:</strong> ${data.assessmentTitle}</p>
      <p style="margin: 8px 0;"><strong>Vendor:</strong> ${data.vendorName}</p>
      <p style="margin: 8px 0;"><strong>Submitted:</strong> ${data.submittedDate}</p>
      ${data.score !== null ? `<p style="margin: 8px 0;"><strong>AI Risk Score:</strong> ${data.score}/100 (${data.riskLevel})</p>` : ''}
    </div>
    
    <p>Please review the responses and complete your evaluation.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.detailLink}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Review Assessment →
      </a>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Assessment Submitted

Hello ${data.recipientName},

${data.vendorName} has completed and submitted their security assessment.

Submission Details:
- Assessment: ${data.assessmentTitle}
- Vendor: ${data.vendorName}
- Submitted: ${data.submittedDate}
${data.score !== null ? `- AI Risk Score: ${data.score}/100 (${data.riskLevel})` : ''}

Review the assessment here:
${data.detailLink}
    `,
  }),

  // Assessment completed/approved notification (to vendor)
  assessment_completed: (data: {
    vendorName: string;
    vendorContact: string;
    assessmentTitle: string;
    completedDate: string;
    senderCompany: string;
  }) => ({
    subject: `Assessment Complete: ${data.assessmentTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Complete</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Assessment Complete</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Hello ${data.vendorContact},</p>
    
    <p>Great news! <strong>${data.senderCompany}</strong> has reviewed and approved your security assessment.</p>
    
    <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #86efac;">
      <h3 style="margin-top: 0; color: #166534;">Assessment Approved</h3>
      <p style="margin: 8px 0;"><strong>Assessment:</strong> ${data.assessmentTitle}</p>
      <p style="margin: 8px 0;"><strong>Completed:</strong> ${data.completedDate}</p>
    </div>
    
    <p>Thank you for completing this assessment. This helps ensure a secure partnership between our organizations.</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    
    <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
      If you have questions about the assessment results, please contact ${data.senderCompany} directly.
    </p>
  </div>
</body>
</html>
    `,
    text: `
Assessment Complete

Hello ${data.vendorContact},

Great news! ${data.senderCompany} has reviewed and approved your security assessment.

Assessment: ${data.assessmentTitle}
Completed: ${data.completedDate}

Thank you for completing this assessment. This helps ensure a secure partnership between our organizations.
    `,
  }),
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, assessment_id, vendor_id, recipient_email, custom_message } = await req.json();

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev';
    const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const COMPANY_NAME = Deno.env.get('COMPANY_NAME') || 'VendorVigilance';

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch assessment data
    let assessment: any = null;
    let vendor: any = null;
    let assessmentOwner: any = null;

    if (assessment_id) {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('vendor_assessments')
        .select('*, vendors(*)')
        .eq('id', assessment_id)
        .single();

      if (assessmentError) throw assessmentError;
      assessment = assessmentData;
      vendor = assessmentData.vendors;

      // Get assessment owner
      if (assessment.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(assessment.user_id);
        assessmentOwner = userData?.user;
      }
    } else if (vendor_id) {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendor_id)
        .single();

      if (vendorError) throw vendorError;
      vendor = vendorData;
    }

    // Generate portal link
    const portalLink = assessment 
      ? `${APP_URL}/vendor-portal?token=${assessment.access_token}`
      : '';

    // Generate detail link for internal users
    const detailLink = assessment
      ? `${APP_URL}/assessments/${assessment.id}`
      : '';

    // Calculate days remaining
    const daysRemaining = assessment
      ? Math.ceil((new Date(assessment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate progress (simple estimate based on status)
    const progressMap: Record<string, number> = {
      pending: 0,
      in_progress: 50,
      submitted: 100,
      under_review: 100,
      completed: 100,
    };
    const progress = assessment ? (progressMap[assessment.status] || 0) : 0;

    // Determine recipient and email content
    let toEmail: string;
    let emailContent: { subject: string; html: string; text: string };

    switch (type) {
      case 'assessment_invite':
        if (!vendor?.contact_email) {
          throw new Error('Vendor contact email is required');
        }
        toEmail = vendor.contact_email;
        emailContent = templates.assessment_invite({
          vendorName: vendor.name,
          vendorContact: vendor.contact_name || 'Team',
          assessmentTitle: assessment.title,
          dueDate: new Date(assessment.due_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          portalLink,
          senderCompany: COMPANY_NAME,
        });
        break;

      case 'assessment_reminder':
        if (!vendor?.contact_email) {
          throw new Error('Vendor contact email is required');
        }
        toEmail = vendor.contact_email;
        emailContent = templates.assessment_reminder({
          vendorName: vendor.name,
          vendorContact: vendor.contact_name || 'Team',
          assessmentTitle: assessment.title,
          dueDate: new Date(assessment.due_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          daysRemaining,
          portalLink,
          progress,
          senderCompany: COMPANY_NAME,
        });

        // Update reminder_sent_at
        await supabase
          .from('vendor_assessments')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', assessment_id);
        break;

      case 'assessment_submitted':
        if (!assessmentOwner?.email) {
          throw new Error('Assessment owner email not found');
        }
        toEmail = assessmentOwner.email;
        emailContent = templates.assessment_submitted({
          vendorName: vendor.name,
          assessmentTitle: assessment.title,
          submittedDate: new Date(assessment.submitted_date || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          score: assessment.score,
          riskLevel: assessment.risk_level,
          detailLink,
          recipientName: assessmentOwner.user_metadata?.full_name || 'Team',
        });
        break;

      case 'assessment_completed':
        if (!vendor?.contact_email) {
          throw new Error('Vendor contact email is required');
        }
        toEmail = vendor.contact_email;
        emailContent = templates.assessment_completed({
          vendorName: vendor.name,
          vendorContact: vendor.contact_name || 'Team',
          assessmentTitle: assessment.title,
          completedDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          senderCompany: COMPANY_NAME,
        });
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Override recipient if specified
    if (recipient_email) {
      toEmail = recipient_email;
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: toEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Log the email send
    await supabase.from('activities').insert({
      type: 'email_sent',
      title: `Email sent: ${type}`,
      description: `${emailContent.subject} sent to ${toEmail}`,
      vendor_id: vendor?.id,
      user_id: assessment?.user_id,
    });

    return new Response(JSON.stringify({
      success: true,
      message_id: result.id,
      recipient: toEmail,
      type,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


// =============================================================================
// DEPLOYMENT NOTES
// =============================================================================
/*
To deploy this function:

1. Sign up at https://resend.com and get your API key
   - Free tier: 100 emails/day, 3,000/month
   - Verify a domain for production, or use onboarding@resend.dev for testing

2. Add secrets in Supabase Dashboard:
   - Go to Project Settings > Edge Functions > Secrets
   - Add these secrets:
     - RESEND_API_KEY: your Resend API key
     - SENDER_EMAIL: your verified sender (e.g., notifications@yourdomain.com)
     - APP_URL: your app URL (e.g., https://vendorvigilance.com)
     - COMPANY_NAME: your company name (shown in emails)

3. Deploy the function:
   npx supabase functions deploy send-notification

4. Call from your app:

   // Send assessment invitation
   await supabase.functions.invoke('send-notification', {
     body: {
       type: 'assessment_invite',
       assessment_id: 'uuid-here',
     },
   });

   // Send reminder
   await supabase.functions.invoke('send-notification', {
     body: {
       type: 'assessment_reminder',
       assessment_id: 'uuid-here',
     },
   });

   // Notify owner of submission
   await supabase.functions.invoke('send-notification', {
     body: {
       type: 'assessment_submitted',
       assessment_id: 'uuid-here',
     },
   });

   // Notify vendor of completion
   await supabase.functions.invoke('send-notification', {
     body: {
       type: 'assessment_completed',
       assessment_id: 'uuid-here',
     },
   });

EMAIL TYPES:
- assessment_invite: Sent to vendor when assessment is created
- assessment_reminder: Sent to vendor X days before due date
- assessment_submitted: Sent to assessment owner when vendor submits
- assessment_completed: Sent to vendor when assessment is approved

TESTING:
- Use onboarding@resend.dev as sender for development
- Emails will be delivered but may go to spam without domain verification
- Verify your domain in Resend for production use
*/
