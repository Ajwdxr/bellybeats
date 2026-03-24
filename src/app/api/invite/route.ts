import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, inviterName, inviteLink } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Email not sent.');
      return NextResponse.json({ 
        success: false, 
        message: 'Email provider not configured. Please use the copy link feature instead.' 
      }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BellyBeats <onboarding@resend.dev>', // Default Resend test domain
        to: [email],
        subject: `Invitation to monitor ${inviterName}'s baby kicks`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1;">BellyBeats Invitation</h2>
            <p>Hi there!</p>
            <p><strong>${inviterName}</strong> has invited you to monitor their baby's kick activity in real-time using the BellyBeats app.</p>
            <p>Click the button below to create your account and start monitoring:</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Accept Invitation</a>
            <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link in your browser:</p>
            <p style="color: #666; font-size: 12px;">${inviteLink}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 10px; text-align: center;">BellyBeats App • Track every precious moment</p>
          </div>
        `,
      }),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await res.json();
      return NextResponse.json({ success: false, error: errorData }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
