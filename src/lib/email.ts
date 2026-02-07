
// src/lib/email.ts
import { Resend } from 'resend';

// Use a type assertion or optional chaining if the type definition is missing, but env vars should be available.
// However, since this runs in Cloudflare Workers (or similar), we might need to pass the API key from `env`.
// But for now, let's assume `import.meta.env` works in Astro components/pages, 
// but for Cloudflare Functions (like the webhook), we usually pass `env` from the request.
// The guide uses `import.meta.env.RESEND_API_KEY`. Let's stick to the guide for now, 
// but in the webhook we might need to initialize Resend differently if `import.meta.env` isn't available in CF Functions context in the same way.
// Actually, in `functions/`, `import.meta.env` might not work. We should probably export a factory function or pass the key.
// But the guide says:
// const resend = new Resend(import.meta.env.RESEND_API_KEY);
// I'll follow the guide but add a check.

const resendApiKey = import.meta.env.RESEND_API_KEY; 
// Note: In CF Pages Functions, env vars are passed in the `env` object to the handler.
// But this is a library file.
// If this file is imported by `functions/api/webhooks/tripay.ts`, `import.meta.env` might be empty during the build or runtime depending on how Astro builds the functions.
// Let's modify the function to accept the API key or env object to be safe, or check `process.env` if available.
// However, to strictly follow the guide first:

const resend = new Resend(resendApiKey);

interface OrderEmailData {
  to: string;
  customerName: string;
  productName: string;
  amount: number;
  reference: string;
  downloadUrl?: string;
  resendApiKey?: string; // Add this to allow passing the key if needed
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  // Allow passing key dynamically if import.meta.env fails
  const key = data.resendApiKey || resendApiKey;
  
  if (!key) {
    console.log('Resend not configured, skipping email');
    return;
  }
  
  // Re-initialize if key was passed dynamically
  const client = data.resendApiKey ? new Resend(data.resendApiKey) : resend;

  await client.emails.send({
    from: 'Narzo Store <noreply@narzo.store>',
    to: data.to,
    subject: `Order Confirmed - ${data.reference}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Thank you for your order!</h1>
        
        <p>Hi ${data.customerName},</p>
        <p>Your payment has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order:</strong> ${data.reference}</p>
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Amount:</strong> Rp ${data.amount.toLocaleString()}</p>
        </div>
        
        ${data.downloadUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.downloadUrl}" 
               style="background: #6366f1; color: white; padding: 12px 24px; 
                      border-radius: 8px; text-decoration: none;">
              Download Your Product
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This download link is valid for 7 days and can be used 3 times.
          </p>
        ` : ''}
        
        <p>Check your order status anytime: 
          <a href="https://narzo.store/order/${data.reference}">View Order</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Narzo Store • https://narzo.store
        </p>
      </div>
    `
  });
}
