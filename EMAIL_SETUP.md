# Email Setup Guide

Your forms are now configured to send real emails using Resend. Follow these steps to complete the setup:

## 1. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to the API Keys section in your dashboard
3. Create a new API key and copy it

## 2. Add Environment Variable

Add your Resend API key to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your API key from step 1

## 3. Set Up Your Domain (Optional but Recommended)

For better deliverability, verify your domain in Resend:

1. In your Resend dashboard, go to Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update the `from` field in `lib/email.tsx` to use your domain:
   \`\`\`tsx
   from: 'Cloud SnS <noreply@yourdomain.com>'
   \`\`\`

## 4. Test Your Forms

Once configured, your forms will:

- **Contact Form**: Send messages to `cloudsns@outlook.com`
- **Signup Form**: Send OTP codes to users and welcome emails after verification

## Current Status

✅ Resend package installed  
✅ Email templates created  
✅ API routes configured  
⏳ Waiting for RESEND_API_KEY environment variable  

## Troubleshooting

If emails aren't sending:
1. Check that `RESEND_API_KEY` is set in your environment variables
2. Verify your API key is valid in the Resend dashboard
3. Check the browser console for error messages
4. Ensure your domain is verified (if using a custom domain)
