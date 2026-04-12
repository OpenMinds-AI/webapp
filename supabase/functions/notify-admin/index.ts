const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const ADMIN_EMAIL = 'victoria.michaux@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

    const { type, record } = await req.json();

    let subject = '';
    let html = '';

    if (type === 'talent') {
      subject = `🔔 New Talent Application: ${record.full_name}`;
      html = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #fff; margin-bottom: 8px;">New Builder Application</h1>
          <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Someone wants to join the collective.</p>
          <div style="background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 12px; padding: 24px;">
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Name</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.full_name}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Email</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.email}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Country</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.country}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Role</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.primary_role || '—'}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Skills</p>
            <p style="color: #fff; font-size: 15px; margin: 0;">${(record.skills || []).join(', ') || '—'}</p>
          </div>
          <p style="color: #5B3FA6; font-size: 13px; margin-top: 24px;">Review in admin dashboard →</p>
        </div>
      `;
    } else if (type === 'venture') {
      subject = `🔔 New Project Brief: ${record.full_name}`;
      html = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #fff; margin-bottom: 8px;">New Project Brief</h1>
          <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Someone submitted a project request.</p>
          <div style="background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 12px; padding: 24px;">
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Name</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.full_name}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Email</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.email}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Intent</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.intent_group || '—'}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Budget</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.budget_range || '—'}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Timeline</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.timeline || '—'}</p>
            ${record.description ? `
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Description</p>
            <p style="color: #999; font-size: 14px; margin: 0;">${record.description}</p>
            ` : ''}
          </div>
          <p style="color: #5B3FA6; font-size: 13px; margin-top: 24px;">Review in admin dashboard →</p>
        </div>
      `;
    } else if (type === 'partner') {
      subject = `🔔 New Partner Application: ${record.full_name}`;
      html = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 16px;">
          <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #fff; margin-bottom: 8px;">New Partner Application</h1>
          <p style="color: #666; font-size: 14px; margin-bottom: 32px;">Someone wants to partner with OpenMinds AI.</p>
          <div style="background: #0D0D0D; border: 1px solid #1A1A1A; border-radius: 12px; padding: 24px;">
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Name</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.full_name}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Email</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.email}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Company</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.company_name}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">Stage</p>
            <p style="color: #fff; font-size: 15px; margin: 0 0 16px;">${record.stage || '—'}</p>
            <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">They offer</p>
            <p style="color: #fff; font-size: 15px; margin: 0;">${(record.what_they_offer || []).join(', ') || '—'}</p>
          </div>
          <p style="color: #5B3FA6; font-size: 13px; margin-top: 24px;">Review in admin dashboard →</p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: 'Unknown type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'OpenMinds AI <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Resend API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
