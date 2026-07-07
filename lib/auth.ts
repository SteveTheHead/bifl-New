import { db } from "@/db/drizzle";
import { account, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

// Initialize Resend client for sending verification emails
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'https://www.buyitforlifeproducts.com',
  trustedOrigins: [
    'https://www.buyitforlifeproducts.com',
    'https://buyitforlifeproducts.com',
    'http://localhost:3000'
  ],
  allowedDevOrigins: ['http://localhost:3000'],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'better-auth',
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buyitforlifeproducts.com';

      try {
        await resend.emails.send({
          from: 'Buy It For Life <hello@buyitforlifeproducts.com>',
          to: user.email,
          subject: 'Verify your email address',
          text: `Welcome to Buy It For Life!

Hi there,

Thanks for signing up! Please verify your email address to get started with discovering products that last a lifetime.

Click here to verify your email: ${url}

Or copy and paste this link into your browser:
${url}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Buy It For Life - Products That Last
${appUrl}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                  .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome to Buy It For Life!</h1>
                  </div>
                  <div class="content">
                    <p>Hi there,</p>
                    <p>Thanks for signing up! Please verify your email address to get started with discovering products that last a lifetime.</p>
                    <p style="text-align: center;">
                      <a href="${url}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">${url}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                  </div>
                  <div class="footer">
                    <p>Buy It For Life - Products That Last</p>
                    <p>${appUrl}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log('✅ Verification email sent to:', user.email);
      } catch (error) {
        console.error('❌ Failed to send verification email:', error);
        throw error;
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_client_secret",
    },
  },
  plugins: [nextCookies()],
});
