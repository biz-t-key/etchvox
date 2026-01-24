import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a One-Time Password (OTP) to the user's email for Vault restoration.
 */
export async function sendOtpEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'EtchVox <auth@etchvox.com>',
      to: [email],
      subject: 'Your EtchVox Vault Access Code',
      html: `
        <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 20px;">
          <h1 style="color: #00f0ff; text-align: center;">ETCHVOX</h1>
          <p style="text-align: center; color: #9ca3af;">Securing your vocal identity archives.</p>
          <div style="background-color: #111; padding: 20px; border-radius: 12px; border: 1px solid #333; text-align: center; margin: 30px 0;">
            <p style="text-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 2px;">Your Verification Code</p>
            <h2 style="font-size: 32px; letter-spacing: 10px; color: #fff; margin: 10px 0;">${otp}</h2>
          </div>
          <p style="font-size: 12px; color: #444; text-align: center; margin-top: 40px;">
            "Official seals move slow, but the expiry of love is swift."<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Mail Service Error:', err);
    throw err;
  }
}
